'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users, MessageSquare, Heart, DollarSign, AlertTriangle,
  TrendingUp, Search, Ban, CheckCircle, Eye, MoreHorizontal,
  BarChart3, Shield, Crown, Activity, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import Link from 'next/link';

const stats = [
  { label: 'Total Users', value: '24,592', change: '+12%', up: true, icon: Users },
  { label: 'Active Matches', value: '8,431', change: '+8%', up: true, icon: Heart },
  { label: 'Messages Today', value: '45,231', change: '+23%', up: true, icon: MessageSquare },
  { label: 'Revenue', value: '$48,392', change: '+15%', up: true, icon: DollarSign },
];

const recentUsers = [
  { id: '1', name: 'Sarah Johnson', email: 'sarah@example.com', status: 'active', joined: '2 min ago', verified: true, premium: false },
  { id: '2', name: 'Michael Chen', email: 'michael@example.com', status: 'active', joined: '15 min ago', verified: true, premium: true },
  { id: '3', name: 'Jessica Williams', email: 'jessica@example.com', status: 'suspended', joined: '1 hour ago', verified: false, premium: false },
  { id: '4', name: 'David Brown', email: 'david@example.com', status: 'active', joined: '2 hours ago', verified: true, premium: true },
  { id: '5', name: 'Emily Davis', email: 'emily@example.com', status: 'active', joined: '3 hours ago', verified: true, premium: false },
];

const reports = [
  { id: '1', reporter: 'User #1234', reported: 'User #5678', type: 'Inappropriate Content', status: 'pending', date: '10 min ago' },
  { id: '2', reporter: 'User #2345', reported: 'User #6789', type: 'Harassment', status: 'under_review', date: '1 hour ago' },
  { id: '3', reporter: 'User #3456', reported: 'User #7890', type: 'Fake Profile', status: 'resolved', date: '3 hours ago' },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-midnight-950">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 bottom-0 w-64 bg-midnight-900 border-r border-midnight-800 hidden lg:block">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-amora-gradient rounded-lg flex items-center justify-center">
              <Heart className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="font-bold">Amora Admin</span>
          </Link>

          <nav className="space-y-1">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'reports', label: 'Reports', icon: AlertTriangle },
              { id: 'moderation', label: 'Moderation', icon: Shield },
              { id: 'analytics', label: 'Analytics', icon: Activity },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === item.id
                    ? 'bg-amora-500/10 text-amora-400'
                    : 'text-midnight-400 hover:bg-midnight-800 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-midnight-950/90 backdrop-blur-xl border-b border-midnight-800">
          <div className="px-6 h-16 flex items-center justify-between">
            <h1 className="font-bold text-lg capitalize">{activeTab}</h1>
            <div className="flex items-center gap-4">
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-midnight-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-64 bg-midnight-900 border border-midnight-700 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-amora-500 transition-all"
                />
              </div>
              <div className="w-8 h-8 bg-amora-500 rounded-full flex items-center justify-center text-sm font-bold">
                A
              </div>
            </div>
          </div>
        </header>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-midnight-900 border border-midnight-800 rounded-2xl p-5"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 bg-amora-500/10 rounded-xl flex items-center justify-center">
                        <stat.icon className="w-5 h-5 text-amora-400" />
                      </div>
                      <div className={`flex items-center gap-1 text-xs font-medium ${stat.up ? 'text-emerald-400' : 'text-red-400'}`}>
                        {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {stat.change}
                      </div>
                    </div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-midnight-400 mt-1">{stat.label}</p>
                  </motion.div>
                ))}
              </div>

              {/* Recent Users */}
              <div className="bg-midnight-900 border border-midnight-800 rounded-2xl overflow-hidden">
                <div className="p-5 border-b border-midnight-800 flex items-center justify-between">
                  <h3 className="font-semibold">Recent Users</h3>
                  <button className="text-sm text-amora-400 hover:text-amora-300">View All</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-xs text-midnight-500 uppercase">
                        <th className="px-5 py-3 font-medium">User</th>
                        <th className="px-5 py-3 font-medium">Status</th>
                        <th className="px-5 py-3 font-medium">Joined</th>
                        <th className="px-5 py-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentUsers.map((user) => (
                        <tr key={user.id} className="border-t border-midnight-800 hover:bg-midnight-800/50 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-midnight-700 rounded-full flex items-center justify-center text-sm font-bold">
                                {user.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-medium text-sm">{user.name}</p>
                                <p className="text-xs text-midnight-500">{user.email}</p>
                              </div>
                              {user.verified && <Shield className="w-4 h-4 text-emerald-400" />}
                              {user.premium && <Crown className="w-4 h-4 text-gold-400" />}
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                              user.status === 'active'
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : 'bg-red-500/10 text-red-400'
                            }`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                              {user.status}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-sm text-midnight-400">{user.joined}</td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <button className="p-1.5 hover:bg-midnight-800 rounded-lg transition-colors">
                                <Eye className="w-4 h-4 text-midnight-400" />
                              </button>
                              <button className="p-1.5 hover:bg-midnight-800 rounded-lg transition-colors">
                                <Ban className="w-4 h-4 text-red-400" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Reports */}
              <div className="bg-midnight-900 border border-midnight-800 rounded-2xl overflow-hidden">
                <div className="p-5 border-b border-midnight-800 flex items-center justify-between">
                  <h3 className="font-semibold">Recent Reports</h3>
                  <button className="text-sm text-amora-400 hover:text-amora-300">View All</button>
                </div>
                <div className="divide-y divide-midnight-800">
                  {reports.map((report) => (
                    <div key={report.id} className="p-5 flex items-center justify-between hover:bg-midnight-800/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          report.status === 'pending' ? 'bg-yellow-500/10' :
                          report.status === 'under_review' ? 'bg-amora-500/10' :
                          'bg-emerald-500/10'
                        }`}>
                          <AlertTriangle className={`w-5 h-5 ${
                            report.status === 'pending' ? 'text-yellow-400' :
                            report.status === 'under_review' ? 'text-amora-400' :
                            'text-emerald-400'
                          }`} />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{report.type}</p>
                          <p className="text-xs text-midnight-500 mt-0.5">
                            {report.reporter} reported {report.reported} • {report.date}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          report.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400' :
                          report.status === 'under_review' ? 'bg-amora-500/10 text-amora-400' :
                          'bg-emerald-500/10 text-emerald-400'
                        }`}>
                          {report.status.replace('_', ' ')}
                        </span>
                        <button className="p-1.5 hover:bg-midnight-800 rounded-lg transition-colors">
                          <MoreHorizontal className="w-4 h-4 text-midnight-400" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
