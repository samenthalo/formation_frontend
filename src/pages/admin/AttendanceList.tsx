import React, { useState } from 'react';
import { Search, Filter, Calendar, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface Attendance {
  id: string;
  traineeId: string;
  traineeName: string;
  sessionId: string;
  sessionTitle: string;
  date: string;
  morning: {
    status: 'present' | 'absent' | 'late';
    time?: string;
    note?: string;
  };
  afternoon: {
    status: 'present' | 'absent' | 'late';
    time?: string;
    note?: string;
  };
}

const AttendanceList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSession, setSelectedSession] = useState('all');

  // Example attendance data
  const attendances: Attendance[] = [
    {
      id: '1',
      traineeId: '1',
      traineeName: 'Marie Martin',
      sessionId: '1',
      sessionTitle: 'Formation React Avancé',
      date: '2024-03-15',
      morning: {
        status: 'present',
        time: '09:00'
      },
      afternoon: {
        status: 'present',
        time: '14:00'
      }
    },
    {
      id: '2',
      traineeId: '2',
      traineeName: 'Jean Dupont',
      sessionId: '1',
      sessionTitle: 'Formation React Avancé',
      date: '2024-03-15',
      morning: {
        status: 'late',
        time: '09:15',
        note: 'Retard transport'
      },
      afternoon: {
        status: 'present',
        time: '14:00'
      }
    }
  ];

  const getStatusIcon = (status: 'present' | 'absent' | 'late') => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'absent':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'late':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusText = (status: 'present' | 'absent' | 'late') => {
    switch (status) {
      case 'present':
        return 'Présent';
      case 'absent':
        return 'Absent';
      case 'late':
        return 'En retard';
    }
  };

  const getStatusClass = (status: 'present' | 'absent' | 'late') => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      case 'late':
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Suivi des présences</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Rechercher un stagiaire..."
                  className="pl-10 input-field w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="w-48">
              <input
                type="date"
                className="input-field w-full"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <button className="btn-secondary flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <span>Filtres</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stagiaire
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Session
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Matin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Après-midi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attendances.map((attendance) => (
                <tr key={attendance.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {attendance.traineeName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {attendance.sessionTitle}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2 text-sm text-gray-900">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>{new Date(attendance.date).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(attendance.morning.status)}
                      <div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusClass(attendance.morning.status)}`}>
                          {getStatusText(attendance.morning.status)}
                        </span>
                        {attendance.morning.time && (
                          <div className="text-sm text-gray-500 mt-1">
                            <Clock className="h-4 w-4 inline mr-1" />
                            {attendance.morning.time}
                          </div>
                        )}
                        {attendance.morning.note && (
                          <div className="text-sm text-gray-500 mt-1">
                            {attendance.morning.note}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(attendance.afternoon.status)}
                      <div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusClass(attendance.afternoon.status)}`}>
                          {getStatusText(attendance.afternoon.status)}
                        </span>
                        {attendance.afternoon.time && (
                          <div className="text-sm text-gray-500 mt-1">
                            <Clock className="h-4 w-4 inline mr-1" />
                            {attendance.afternoon.time}
                          </div>
                        )}
                        {attendance.afternoon.note && (
                          <div className="text-sm text-gray-500 mt-1">
                            {attendance.afternoon.note}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendanceList;