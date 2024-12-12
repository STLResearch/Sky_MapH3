import React from 'react';
import * as turf from '@turf/turf';

const HexDetails = ({ hexes, hexSize }) => {
  if (!hexes || hexes.length === 0) {
    return null;
  }

  return (
    <div className="hex-details">
      {hexes.map((hex, index) => {
        const perimeter = hex.boundary.reduce((total, point, i, arr) => {
          const nextPoint = arr[(i + 1) % arr.length];
          const from = turf.point(point);
          const to = turf.point(nextPoint);
          return total + turf.distance(from, to, { units: 'kilometers' });
        }, 0);

        return (
          <div key={index} className="mb-4 border-b border-gray-600 pb-2">
            <p>
              <strong>Hex Index:</strong> {hex.hexIndex}
            </p>
            <p>
              <strong> Base Cell :</strong> {hex.baseCell}
            </p>
            
            <p>
              <strong>IcosahedronFaces :</strong> {hex.icosa}
            </p>
            
            <p>
              <strong>Geometrical Area:</strong>{" "}
              {hex.area ? hex.area.toFixed(2) : "N/A"} km²
            </p>
            <p>
              <strong>Hex Edge length:</strong> {perimeter.toFixed(2)} km
            </p>
            <p><strong>Is pentagon:</strong>No</p>
            <p>
              <strong>Hex Resolution:</strong> {hexSize}
            </p>
            <p>
              <strong>Number of Boundary Vertices:</strong> 6
            </p>
            <h4 className="text-sm font-semibold mt-2">
              6 Points - Boundary Coordinates:
            </h4>
            <ul className="pl-4 list-disc">
              {hex.boundary.map(([lat, lng], i) => (
                <li key={i}>
                  <strong>Point {i + 1}:</strong> Latitude: {lat.toFixed(6)}, Longitude:{" "}
                  {lng.toFixed(6)}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
};

export default HexDetails;
