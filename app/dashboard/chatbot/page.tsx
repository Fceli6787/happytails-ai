import React from "react";
import Chatbot from "../../../components/Chatbot";

export const metadata = {
  title: "Chatbot - Dashboard",
};

export default function Page() {
  return (
    <div style={{ padding: 24 }}>
      <h1>Chatbot</h1>
      <p>Esta es la página del chatbot. La burbuja flotante aparece en la esquina inferior derecha.</p>
      <Chatbot />
    </div>
  );
}
