import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../store/hooks';
import { getBackendUrlSync } from '../utils/portDetector';

const SubscriptionAdmin: React.FC = () => {
    const { user } = useAuth();
    const token = localStorage.getItem("token");
    const [subscriptions, setSubscriptions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Password protection state
    const [isPasswordVerified, setIsPasswordVerified] = useState(false);
    const [passwordInput, setPasswordInput] = useState("");
    const [passwordError, setPasswordError] = useState("");

    useEffect(() => {
        if (isPasswordVerified) {
            fetchSubscriptions();
        }
    }, [token, isPasswordVerified]);

    const fetchSubscriptions = async () => {
        if (!token) {
            console.log("No token found, stopping load.");
            setLoading(false);
            return;
        }
        try {
            const baseUrl = window.location.hostname.includes("devtunnels")
                ? `https://${window.location.hostname}`
                : process.env.NODE_ENV === "production"
                    ? "https://your-domain.com"
                    : getBackendUrlSync();

            // Using JobModeration header as this seems to be the convention for admin bypass/auth in this app
            const response = await axios.get(`${baseUrl}/api/pricing/admin/pending-subscriptions`, {
                headers: { Authorization: `Bearer ${token}`, "x-admin-code": "JobModeration" }
            });
            // Handle potential structure differences. The original code used (response.data as any).subscriptions
            const data = response.data as any;
            setSubscriptions(data.subscriptions || []);
        } catch (error: any) {
            console.error("Error fetching subscriptions", error);
            if (error.response?.status === 401 || error.response?.status === 403) {
                // Redirect to login or show clear error
                alert("Session expired or unauthorized. Please login again.");
                // window.location.href = "/login"; // Optional: redirect
            }
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (userId: string) => {
        try {
            const baseUrl = window.location.hostname.includes("devtunnels")
                ? `https://${window.location.hostname}`
                : process.env.NODE_ENV === "production"
                    ? "https://your-domain.com"
                    : getBackendUrlSync();

            await axios.post(`${baseUrl}/api/pricing/admin/approve/${userId}`, {}, {
                headers: { Authorization: `Bearer ${token}`, "x-admin-code": "JobModeration" }
            });
            alert("Approved!");
            fetchSubscriptions();
        } catch (error) {
            console.error(error);
            alert("Failed to approve");
        }
    }

    const handleReject = async (userId: string) => {
        try {
            const baseUrl = window.location.hostname.includes("devtunnels")
                ? `https://${window.location.hostname}`
                : process.env.NODE_ENV === "production"
                    ? "https://your-domain.com"
                    : getBackendUrlSync();

            await axios.post(`${baseUrl}/api/pricing/admin/reject/${userId}`, {}, {
                headers: { Authorization: `Bearer ${token}`, "x-admin-code": "JobModeration" }
            });
            alert("Rejected!");
            fetchSubscriptions();
        } catch (error) {
            console.error(error);
            alert("Failed to reject");
        }
    }

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordInput === "0991313700Yf@") {
            setIsPasswordVerified(true);
            setPasswordError("");
        } else {
            setPasswordError("Incorrect password. Access denied.");
        }
    };

    if (!isPasswordVerified) {
        return (
            <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
                <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                    <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Admin Verification</h1>
                    <p className="text-gray-600 mb-6 text-center">Please enter the admin password to view subscription requests.</p>

                    <form onSubmit={handlePasswordSubmit}>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={passwordInput}
                                onChange={(e) => setPasswordInput(e.target.value)}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                                placeholder="Enter password"
                                autoFocus
                            />
                        </div>

                        {passwordError && (
                            <div className="mb-4 text-red-500 text-sm font-semibold text-center">
                                {passwordError}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors"
                        >
                            Verify & Access
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Subscription Approvals</h1>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center bg-white">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                        <p className="mt-2 text-gray-500">Loading subscriptions...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested At</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {subscriptions.length > 0 ? (
                                    subscriptions.map(sub => (
                                        <tr key={sub._id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{sub.profile?.firstName} {sub.profile?.lastName || 'N/A'}</div>
                                                <div className="text-sm text-gray-500">{sub.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                    {sub.subscription.planName}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {sub.subscription.price} {sub.subscription.currency}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(sub.subscription.subscribedAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={() => handleApprove(sub._id)}
                                                    className="text-white bg-green-600 hover:bg-green-700 px-3 py-1 rounded mr-3 transition-colors"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleReject(sub._id)}
                                                    className="text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded transition-colors"
                                                >
                                                    Reject
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                            No pending subscriptions found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SubscriptionAdmin;
