import colors from "tailwindcss/colors";

const ACCESS_LEVEL = {
    STUDENT: 1,
    ALUMNI: 2,
    ACADEMIC: 3,
    ADMINISTRATIVE: 4,
    ADMIN: 5
}

const ROLE = {
    [ACCESS_LEVEL.STUDENT]: "Student",
    [ACCESS_LEVEL.ALUMNI]: "Alumni",
    [ACCESS_LEVEL.ACADEMIC]: "Staff (Academic)",
    [ACCESS_LEVEL.ADMINISTRATIVE]: "Staff (Admin)",
    [ACCESS_LEVEL.ADMIN]: "Admin",
};

const ROLE_COLORS = {
    [ACCESS_LEVEL.STUDENT]: colors.sky[500],
    [ACCESS_LEVEL.ALUMNI]: colors.emerald[400],
    [ACCESS_LEVEL.ACADEMIC]: colors.violet[500],
    [ACCESS_LEVEL.ADMINISTRATIVE]: colors.orange[500],
    [ACCESS_LEVEL.ADMIN]: colors.rose[500],
}

export {
    ACCESS_LEVEL,
    ROLE,
    ROLE_COLORS
}