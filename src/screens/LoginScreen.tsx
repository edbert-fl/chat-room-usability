import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  TokenUpdateContext,
  UserUpdateContext,
} from "../context/UserContextProvider.tsx";
import axios from "axios";
import { bouncy } from "ldrs";
import colors from "tailwindcss/colors";
import { ChatRoomConnectionContext } from "../context/EncryptionContextProvider.tsx";
import { pkdf2DeriveKeysFromPassword } from "../utils/PKDFCrypto.tsx";
import { generateKeyPair } from "../utils/WSCrypto.tsx";

export const LoginScreen = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigation = useNavigate();

  const setCurrUser = useContext(UserUpdateContext);
  const setToken = useContext(TokenUpdateContext);
  const {
    setPublicKey,
    setPrivateKey,
    setPKDF2Key
  } = useContext(ChatRoomConnectionContext);

  // Activity Indicator
  bouncy.register();

  const handleLogin = async () => {
    if (username === null || username.length === 0) {
      setError("Please enter a username");
      return;
    }

    if (password === null || password.length === 0) {
      setError("Please enter a password");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.REACT_APP_HEROKU_URL}/user/login`,
        {
          username: username,
          password: password,
        }
      );
      if (response.status === 200) {
        setCurrUser({
          id: response.data.user.id,
          username: response.data.user.username,
          email: response.data.user.email,
          createdAt: response.data.user.created_at,
        });

        const generatedKeyPair = await generateKeyPair();

        setPrivateKey(generatedKeyPair.privateKey);
        setPublicKey(generatedKeyPair.publicKey);
        setToken(response.data.token);

        const pkdf2Key = await pkdf2DeriveKeysFromPassword(password, response.data.user.salt);
        setPKDF2Key(pkdf2Key);

        setLoading(false);
        navigation("/");
      } else {
        setError(`${response.data.error}`);
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === undefined) {
          setError("An unexpected error occurred.");
        } else {
          setError(`${error.response.data.error}`);
        }
        return;
      } else {
        setError("Network error.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="shadow-md p-10 min-w-80 w-1/4 rounded-lg mb-20 bg-white ">
      <h1 className="text-2xl text-center mb-4 text-teal-600">Login</h1>
      <div className="mb-5">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-3 py-2 mb-4 placeholder-gray-400 text-gray-700 rounded-md bg-gray-100 focus:outline focus:outline-teal-300"
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              handleLogin();
            }
          }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 mb-4 placeholder-gray-500 text-gray-700 rounded-md bg-gray-100 focus:outline focus:outline-teal-300"
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              handleLogin();
            }
          }}
        />
      </div>
      <div className="flex justify-center align-items-center w-full h-20">
        {loading ? (
          <l-bouncy size="35" speed="1.75" color={colors.teal[600]} />
        ) : (
          <div className="flex-col w-full align-items-center">
            <button
              onClick={handleLogin}
              className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring focus:ring-teal-300"
            >
              Login
            </button>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
      </div>
      <div className="text-center">
        <p>Don't have an account?</p>
        <p className="text-teal-600">
          <Link to="/register">Register here!</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;
