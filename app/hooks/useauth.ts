import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  user_id: number;
  full_name:string;
  exp: number;
}

export const useAuth = () => {
  const [user, setUser] = useState<DecodedToken | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setUser(null);
      return;
    }

    try {
      const decoded: DecodedToken = jwtDecode(token);

      // optional: check expiration
      if (decoded.exp * 1000 < Date.now()) {
        console.log("Token expired");
        localStorage.removeItem("full_name")
        localStorage.removeItem("token")
        setUser(null);
        return;
      }
      console.log("hit-decoded")

      setUser(decoded);

    } catch (err) {
      console.error("Invalid token", err);
      setUser(null);
    }
  }, []);

  return user;
};
