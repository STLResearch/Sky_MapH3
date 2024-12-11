"use client";

import { useState } from "react";
import HexMap from "./components/HexMap";
import HexDetails from "./components/HexDetails";

type HexDetailsType = {
  hexIndex: string;
  boundary: number[][];
  area: number;
  hexSize: number;
} | null;

export default function Home() {
  const [hexDetails, setHexDetails] = useState<HexDetailsType>(null);

  return (
    <div className="flex flex-col lg:flex-row w-full h-screen">
      <HexMap setHexDetails={setHexDetails} />
      <div className="p-4">
        <HexDetails hex={hexDetails} />
      </div>
    </div>
  );
}
