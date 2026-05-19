"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const AddMail = () => {
  const [mail, setMail] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem("auth_token");
    if (!token) {
      console.error("No token. User is not authenticated.");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/mail`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ mail }),
        },
      );

      if (response.ok) {
        const data = await response.json();
        console.log("добавлен!", data);
        setMail("");
        router.push("/admin/mails");
      } else {
        const errorText = await response.text();
        console.error("Ошибка при добавлении:", errorText);
      }
    } catch (error) {
      console.error("Ошибка запроса", error);
    }
  };

  return (
    <div className="flex">
      <div className="mt-8">
        <form
          onSubmit={handleSubmit}
          className="w-full mx-auto p-6 border border-gray-300 rounded-lg shadow-lg bg-white"
        >
          <h2 className="text-2xl font-bold mb-4 text-left">Add new mail</h2>

          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">
              Mail address:
            </label>
            <input
              value={mail}
              onChange={(e) => setMail(e.target.value)}
              type="text"
              required
              className="border border-gray-300 rounded p-2 w-full"
            />
          </div>

          <button
            type="submit"
            className="w-full bg hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-150"
          >
            Add mail
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddMail;
