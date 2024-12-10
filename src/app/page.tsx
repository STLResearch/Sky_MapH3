"use client";
import { useState } from "react";
import HexMap from "./components/HexMap";
import HexDetails from "./components/HexDetails";

export default function Home() {
  const [hexDetails, setHexDetails] = useState(null);

  return (
    <div>
      <HexMap setHexDetails={setHexDetails} />
      <HexDetails hex={hexDetails} />
    </div>
  );
}