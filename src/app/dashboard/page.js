"use client";
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Clock, CheckCircle, XCircle } from 'lucide-react';

export default function DashboardPage() {
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({ pending: 0, confirmed: 0 });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [resReq, resStats] = await Promise.all([
        api.get('/rentals'),
        api.get('/admin/stats')
      ]);
      setRequests(resReq.data);
      setStats(resStats.data);
    } catch (err) {
      console.error("Dashboard failed to load", err);
    }
  };

  const updateStatus = async (id, status) => {
    await api.put(`/admin/rentals/${id}`, { status });
    loadData();
  };

  return (
    <div className="space-y-8">
      {/* Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 text-yellow-600 rounded-lg"><Clock /></div>
            <div>
              <p className="text-sm text-gray-500">Pending Requests</p>
              <h2 className="text-3xl font-bold">{stats.pending || 0}</h2>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 text-green-600 rounded-lg"><CheckCircle /></div>
            <div>
              <p className="text-sm text-gray-500">Confirmed Bookings</p>
              <h2 className="text-3xl font-bold">{stats.confirmed || 0}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="font-bold text-lg">Recent Rental Requests</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-sm uppercase">
              <tr>
                <th className="p-4">Customer</th>
                <th className="p-4">Vehicle</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req._id} className="border-b last:border-0 hover:bg-gray-50 transition">
                  <td className="p-4 font-medium">{req.customerName}</td>
                  <td className="p-4">{req.car?.name?.en}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${req.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {req.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 flex justify-center gap-4">
                    <button onClick={() => updateStatus(req._id, 'confirmed')} className="text-green-600 hover:scale-110 transition"><CheckCircle size={20}/></button>
                    <button onClick={() => updateStatus(req._id, 'cancelled')} className="text-red-600 hover:scale-110 transition"><XCircle size={20}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}