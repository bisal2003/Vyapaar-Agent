import { X, TrendingUp, TrendingDown, Users, Receipt } from 'lucide-react';
import { useState, useEffect } from 'react';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';

const Dashboard = ({ isOpen, onClose }) => {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalReceivable: 0,
    totalPayable: 0,
    recentTransactions: [],
  });
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchDashboardData();
    }
  }, [isOpen]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, customersRes] = await Promise.all([
        axiosInstance.get('/transactions/stats/dashboard'),
        axiosInstance.get('/customers'),
      ]);
      
      setStats(statsRes.data);
      setCustomers(customersRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-6xl h-[90vh] bg-base-100 rounded-lg shadow-xl overflow-hidden flex flex-col m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-base-300 bg-gradient-to-r from-primary/10 to-transparent">
          <div>
            <h2 className="text-2xl font-bold">📊 Seller Dashboard</h2>
            <p className="text-sm text-base-content/70">Real-time business insights</p>
          </div>
          <button
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600 font-medium">Total Sales</p>
                      <p className="text-2xl font-bold text-green-700">
                        ₹{stats.totalSales.toFixed(2)}
                      </p>
                    </div>
                    <Receipt className="text-green-600" size={32} />
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600 font-medium">To Receive</p>
                      <p className="text-2xl font-bold text-blue-700">
                        ₹{stats.totalReceivable.toFixed(2)}
                      </p>
                    </div>
                    <TrendingUp className="text-blue-600" size={32} />
                  </div>
                </div>

                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-red-600 font-medium">To Pay</p>
                      <p className="text-2xl font-bold text-red-700">
                        ₹{stats.totalPayable.toFixed(2)}
                      </p>
                    </div>
                    <TrendingDown className="text-red-600" size={32} />
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-600 font-medium">Customers</p>
                      <p className="text-2xl font-bold text-purple-700">
                        {customers.length}
                      </p>
                    </div>
                    <Users className="text-purple-600" size={32} />
                  </div>
                </div>
              </div>

              {/* Recent Transactions */}
              <div className="bg-base-200 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Recent Transactions</h3>
                <div className="overflow-x-auto">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Invoice #</th>
                        <th>Customer</th>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentTransactions.map((txn) => (
                        <tr key={txn._id}>
                          <td className="font-mono text-xs">{txn.invoiceNumber}</td>
                          <td>{txn.customerName}</td>
                          <td>{new Date(txn.createdAt).toLocaleDateString()}</td>
                          <td className="font-semibold">₹{txn.totalAmount.toFixed(2)}</td>
                          <td>
                            <span
                              className={`badge badge-sm ${
                                txn.paymentStatus === 'paid'
                                  ? 'badge-success'
                                  : txn.paymentStatus === 'unpaid'
                                  ? 'badge-error'
                                  : 'badge-warning'
                              }`}
                            >
                              {txn.paymentStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Customers List */}
              <div className="bg-base-200 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Top Customers</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {customers.slice(0, 6).map((customer) => (
                    <div
                      key={customer._id}
                      className="bg-base-100 p-3 rounded-lg border border-base-300 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold">{customer.name}</p>
                          <p className="text-sm text-base-content/70">{customer.phone}</p>
                          <p className="text-xs text-base-content/60">
                            {customer.totalTransactions} transactions
                          </p>
                        </div>
                        <div className="text-right">
                          <p
                            className={`text-lg font-bold ${
                              customer.balance > 0
                                ? 'text-green-600'
                                : customer.balance < 0
                                ? 'text-red-600'
                                : 'text-base-content/60'
                            }`}
                          >
                            {customer.balance > 0 ? '+' : ''}₹{customer.balance.toFixed(2)}
                          </p>
                          <p className="text-xs text-base-content/60">
                            {customer.balance > 0 ? 'To Receive' : customer.balance < 0 ? 'To Pay' : 'Settled'}
                          </p>
                        </div>
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
};

export default Dashboard;
