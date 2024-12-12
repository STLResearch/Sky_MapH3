"use client";

import { useState } from "react";
import HexMap from "./components/HexMap";
//import HexDetails from "./components/HexDetails";

export default function Home() {
  const [ setHexDetails] = useState(null);

  return (
    <div className="flex flex-col lg:flex-row w-full h-screen">
      <HexMap setHexDetails={setHexDetails} />
      
    </div>
  );
}
