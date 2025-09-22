import React, { useMemo, useState } from "react";

const CinemaSeatBooking = ({
    layout = {
      rows: 8,
      seatsPerRow: 12,
      aislePosition: 5,
    },
    seatTypes = {
      regular: { name: "Regular", price: 150, rows: [0, 1, 2] },
      premium: { name: "Premium", price: 250, rows: [3, 4, 5] },
      vip: { name: "VIP", price: 350, rows: [6, 7] },
    },
    bookedSeats = [],
    currency = "₹",
    onBookingComplete = () => {},
    title = "Cinema Hall Booking",
    subtitle = "Select your preferred seats",
}) => {
  const colors = [
    "blue",
    "purple",
    "yellow",
    "green",
    "red",
    "indigo",
    "pink",
    "gray",
  ];

  const getSeatType = (row) => {
    const seatTypeEntries = Object.entries(seatTypes);

    for (let i = 0; i < seatTypeEntries.length; i++) {
      const [type, config] = seatTypeEntries[i];
      if (config.rows.includes(row)) {
        const color = colors[i % colors.length];
        return { type, color, ...config };
      }
    }

    // fallback
    const [firstType, firstConfig] = seatTypeEntries[0];
    return { type: firstType, color: colors[0], ...firstConfig };
  };

  const initializeSeats = useMemo(() => {
    const seats = [];
    for (let row = 0; row < layout.rows; row++) {
      const seatRow = [];
      const seatTypeInfo = getSeatType(row);

      for (let seat = 0; seat < layout.seatsPerRow; seat++) {
        const seatId = `${String.fromCharCode(65 + row)}${seat + 1}`;

        seatRow.push({
          id: seatId,
          row,
          seat,
          type: seatTypeInfo?.type || "regular",
          price: seatTypeInfo?.price || 150,
          color: seatTypeInfo?.color || "blue",
          status: bookedSeats.includes(seatId) ? "booked" : "available",
          selected: false,
        });
      }
      seats.push(seatRow);
    }
    return seats;
  }, [layout, seatTypes, bookedSeats]);

  const [seats, setSeats] = useState(initializeSeats);

  const getColorClass = (colorName) => {
    const colorMap = {
      blue: "bg-blue-100 border-blue-300 text-blue-800 hover:bg-blue-200",
      purple: "bg-purple-100 border-purple-300 text-purple-800 hover:bg-purple-200",
      yellow: "bg-yellow-100 border-yellow-300 text-yellow-800 hover:bg-yellow-200",
      green: "bg-green-100 border-green-300 text-green-800 hover:bg-green-200",
      red: "bg-red-100 border-red-300 text-red-800 hover:bg-red-200",
      indigo: "bg-indigo-100 border-indigo-300 text-indigo-800 hover:bg-indigo-200",
      pink: "bg-pink-100 border-pink-300 text-pink-800 hover:bg-pink-200",
      gray: "bg-gray-100 border-gray-300 text-gray-800 hover:bg-gray-200",
    };
    return colorMap[colorName] || colorMap.blue;
  };

  const getSeatClassName = (seat) => {
    const baseClass =
      "w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 m-1 rounded-t-lg border-2 cursor-pointer transition-all duration-200 flex items-center justify-center text-xs sm:text-sm font-bold";

    if (seat.status === "booked") {
      return `${baseClass} bg-gray-400 border-gray-500 text-gray-600 cursor-not-allowed`;
    }

    if (seat.selected) {
      return `${baseClass} bg-green-500 border-green-600 text-white transform scale-110`;
    }

    return `${baseClass} ${getColorClass(seat.color)}`;
  };

  const handleSeatClick = (rowIndex, seatIndex) => {
    setSeats((prevSeats) =>
      prevSeats.map((row, rIdx) =>
        row.map((seat, sIdx) => {
          if (rIdx === rowIndex && sIdx === seatIndex && seat.status === "available") {
            return { ...seat, selected: !seat.selected };
          }
          return seat;
        })
      )
    );
  };

  const renderSeatSection = (seatRow, startIndex, endIndex) => (
    <div className="flex">
      {seatRow.slice(startIndex, endIndex).map((seat, index) => (
        <div
          className={getSeatClassName(seat)}
          key={seat.id}
          title={`${seat.id} - ${getSeatType(seat.row)?.name || "Regular"} - ${currency}${seat.price}`}
          onClick={() => handleSeatClick(seat.row, startIndex + index)}
        >
          {startIndex + index + 1}
        </div>
      ))}
    </div>
  );

  const uniqueSeatType = Object.entries(seatTypes).map(([type, config], index) => ({
    type,
    color: colors[index % colors.length],
    ...config,
  }));

  // ✅ Derive selected seats directly from seats (no duplication possible)
  const selectedSeatDetails = seats
    .flat()
    .filter((s) => s.selected)
    .map((s) => ({ id: s.id, price: s.price }));

  const totalPrice = selectedSeatDetails.reduce((sum, s) => sum + s.price, 0);

  return (
    <div className="w-full min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-6">
        {/* Title */}
        <h1 className="text-2xl lg:text-3xl font-bold text-center mb-2 text-gray-800">
          {title}
        </h1>
        <p className="text-center text-gray-600 mb-6">{subtitle}</p>

        {/* Screen */}
        <div className="mb-8">
          <div className="w-full h-4 bg-gradient-to-r from-gray-300 via-gray-400 to-gray-300 rounded-lg mb-2 shadow-inner" />
          <p className="text-center text-sm text-gray-500 font-medium">SCREEN</p>
        </div>

        {/* Seat map */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex flex-col items-center min-w-max">
            {seats.map((row, rowIndex) => (
              <div key={rowIndex} className="flex items-center mb-2">
                <span className="w-8 text-center font-bold text-gray-600 mr-4">
                  {String.fromCharCode(65 + rowIndex)}
                </span>
                {renderSeatSection(row, 0, layout.aislePosition)}
                <div className="w-8"></div>
                {renderSeatSection(row, layout.aislePosition, layout.seatsPerRow)}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-6 mb-6 p-4 bg-gray-50 rounded-lg">
          {uniqueSeatType.map((seatType) => (
            <div key={seatType.type} className="flex items-center">
              <div
                className={`w-6 h-6 border-2 rounded-t-lg mr-2 ${getColorClass(seatType.color)}`}
              ></div>
              <span className="text-sm">
                {seatType.name} ({currency}{seatType.price})
              </span>
            </div>
          ))}
          {/* Special states */}
          <div className="flex items-center">
            <div className="w-6 h-6 border-2 rounded-t-lg mr-2 bg-green-500 border-green-600"></div>
            <span className="text-sm">Selected</span>
          </div>
          <div className="flex items-center">
            <div className="w-6 h-6 border-2 rounded-t-lg mr-2 bg-gray-400 border-gray-500"></div>
            <span className="text-sm">Booked</span>
          </div>
        </div>

        {/* Summary */}
        {selectedSeatDetails.length > 0 && (
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h2 className="text-lg font-semibold text-blue-800 mb-3">Booking Summary</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-blue-700 mb-2">Selected Seats:</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedSeatDetails.map((seat) => (
                    <span 
                      key={seat.id} 
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {seat.id}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-blue-700 mb-2">Price Details:</h3>
                <div className="space-y-1 text-sm">
                  {selectedSeatDetails.map((seat) => (
                    <div key={seat.id} className="flex justify-between">
                      <span>Seat {seat.id}:</span>
                      <span>{currency}{seat.price}</span>
                    </div>
                  ))}
                  <div className="border-t pt-1 mt-1 font-semibold flex justify-between">
                    <span>Total:</span>
                    <span>{currency}{totalPrice}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => {
                const selectedSeats = selectedSeatDetails.map((s) => s.id);
                onBookingComplete(selectedSeats);
                alert(`Booking confirmed for ${selectedSeats.length} seat(s)! Total: ${currency}${totalPrice}`);
              }}
              className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium transition-colors"
            >
              Confirm Booking
            </button>
          </div>
        )}
        
      </div>  
    </div>
  );
};

export default CinemaSeatBooking;


