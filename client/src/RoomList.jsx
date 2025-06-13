import React, { useEffect, useState } from 'react';
import axios from 'axios';


function RoomList() {
  const [rooms, setRooms] = useState([]);
  const backendUrl = "https://society-maintainance-system-bakend.onrender.com"; // Update with your backend URL
  // const backendUrl = "http://localhost:5000"; // Update with your backend URL
  const fetchRooms = async () => {
    const res = await axios.get(`${backendUrl}/rooms`);
    setRooms(res.data);
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handlePayment = async (roomId) => {
    await axios.post(`${backendUrl}/pay/${roomId}`, { monthsPaid: 1 });
    fetchRooms();
  };

  const handleUpdate = async (room) => {
    const newOwner = prompt("Enter new owner name:", room.ownerName);
    const newPending = prompt("Enter pending months:", room.pendingMonths);


    if (newOwner !== null && newPending !== null) {
      await axios.post(`${backendUrl}/update-pending/${room._id}`, {
        ownerName: newOwner,
        pendingMonths: parseInt(newPending)
      });
      fetchRooms();
    }
  };

  return (
<div className="overflow-x-auto p-4">
      <div className="w-full max-w-7xl mx-auto bg-white shadow-md rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-blue-500 to-blue-700 text-white text-lg">
            <tr>
              <th className="py-3 px-4 text-left">Room No</th>
              <th className="py-3 px-4 text-left">Block</th>
              <th className="py-3 px-4 text-left">Owner</th>
              <th className="py-3 px-4 text-left">Pending (months)</th>
              <th className="py-3 px-4 text-center">Pay</th>
              <th className="py-3 px-4 text-center">Update Owner</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {rooms
              .filter(room => room.ownerName !== '-')
              .map(room => (
                <tr key={room._id} className="hover:bg-gray-100 transition">
                  <td className="py-3 px-4">{room.roomNumber}</td>
                  <td className="py-3 px-4">{room.block}</td>
                  <td className="py-3 px-4">{room.ownerName}</td>
                  <td className="py-3 px-4">{room.pendingMonths != null ? room.pendingMonths : "NULL"}</td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => handlePayment(room._id)}
                      className="bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded shadow">
                      Pay 1 Month
                    </button>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => handleUpdate(room)}
                      className="bg-yellow-400 hover:bg-yellow-500 text-white font-semibold px-4 py-2 rounded shadow">
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RoomList;
