import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import * as crypto from "crypto-js";
import { bouncy } from "ldrs";
import colors from "tailwindcss/colors";

import {
  TokenUpdateContext,
  UserUpdateContext,
} from "../context/UserContextProvider.tsx";
import { pkdf2DeriveKeysFromPassword } from "../utils/PKDFCrypto.tsx";
import { ChatRoomConnectionContext } from "../context/EncryptionContextProvider.tsx";
import { generateKeyPair } from "../utils/WSCrypto.tsx";

export const RegisterScreen = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const setCurrUser = useContext(UserUpdateContext);
  const setToken = useContext(TokenUpdateContext);
  const {
    setPublicKey,
    setPrivateKey,
    setPKDF2Key
  } = useContext(ChatRoomConnectionContext);

  const navigation = useNavigate();

  // Activity Indicator
  bouncy.register();

  const handleRegister = async () => {
    if (username === null || username.length === 0) {
      setError("Please enter a username");
      return;
    }

    if (email === null || email.length === 0) {
      setError("Please enter an email address");
      return;
    }

    if (password === null || password.length === 0) {
      setError("Please enter a password");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords need to match");
      return;
    }

    try {
      setLoading(true);
      const salt = crypto.lib.WordArray.random(127).toString(crypto.enc.Base64);
      const hashedPassword = crypto.SHA256(password + salt);
      const hashedPasswordString = hashedPassword.toString(crypto.enc.Base64);

      const pkdf2Key = await pkdf2DeriveKeysFromPassword(password, salt);
      setPKDF2Key(pkdf2Key);

      const response = await axios.post(
        `${process.env.REACT_APP_HEROKU_URL}/user/register`,
        {
          username: username,
          email: email,
          salt: salt,
          hashedPassword: hashedPasswordString,
        }
      );

      if (response.status === 200) {
        setLoading(false);

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

        const pkdf2Key = await pkdf2DeriveKeysFromPassword(password, salt);
        setPKDF2Key(pkdf2Key);
        setLoading(false);
        navigation("/");
      } else {
        setError(`${response.data.error}`);
      }
    } catch (error) {
      if (error.response) {
        setError(`${error.response.data.error}`);
        return;
      } else {
        setError("Network error.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-10 min-w-80 w-1/4 rounded-lg shadow-lg">
      <h1 className="text-2xl text-center mb-4 text-teal-600">Register</h1>
      <div className="mb-5">
        <input
          type="text"
          placeholder="Display Name"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-3 py-2 mb-4 placeholder-gray-400 text-gray-700 rounded-md bg-gray-100 focus:outline focus:outline-teal-300"
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              handleRegister();
            }
          }}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 mb-4 placeholder-gray-400 text-gray-700 rounded-md bg-gray-100 focus:outline focus:outline-teal-300"
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              handleRegister();
            }
          }}
        />
        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 mb-4 placeholder-gray-500 text-gray-700 rounded-md bg-gray-100 focus:outline focus:outline-teal-300"
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              handleRegister();
            }
          }}
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full px-3 py-2 mb-4 placeholder-gray-500 text-gray-700 rounded-md bg-gray-100 focus:outline focus:outline-teal-300"
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              handleRegister();
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
              onClick={handleRegister}
              className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded-md focus:outline focus:outline-teal-300"
            >
              Register
            </button>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
      </div>
      <div className="text-center">
        <p>Already have an account?</p>
        <p className="text-teal-600">
          <Link to="/login">Sign in here!</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterScreen;
