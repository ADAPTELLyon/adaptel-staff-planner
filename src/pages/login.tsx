import * as React from "react";
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const response = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log(response);

    if (response.error) {
      setErrorMsg("Identifiants invalides.");
      console.error(response.error.message);
    } else {
      console.log("Connexion réussie !");
      navigate("/commandes"); // Redirection vers /commandes
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Connexion – Application Web ADAPTEL Lyon
        </h1>

        {errorMsg && (
          <p className="mb-4 text-red-600 text-center text-sm">{errorMsg}</p>
        )}

        <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Adresse email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ex: contact@adaptel.fr"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Mot de passe
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#840404] text-white py-2 rounded-md hover:bg-red-700 transition duration-200"
          >
            Se connecter
          </button>
        </form>
      </div>
    </main>
  );
}
