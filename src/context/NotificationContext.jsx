import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../firebase/config';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const { currentUser, userRole } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser) {
            setNotifications([]);
            setUnreadCount(0);
            setLoading(false);
            return;
        }

        let q;
        const requestsRef = collection(db, 'funding_requests');

        // Define query based on role
        if (userRole === 'funder') {
            // Funders see incoming requests sent to them
            q = query(
                requestsRef,
                where('funderId', '==', currentUser.uid),
                orderBy('createdAt', 'desc')
            );
        } else {
            // Innovators see updates on their sent requests
            q = query(
                requestsRef,
                where('userId', '==', currentUser.uid),
                orderBy('createdAt', 'desc')
            );
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const notes = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                // Helper logic to determine if it should be "active" notification
                // For funders: 'Pending' requests are notifications
                // For innovators: 'Approved' or 'Rejected' requests are notifications (ignore 'Pending' which they sent themselves)
                isRelevant: userRole === 'funder'
                    ? ['Pending', 'Sent'].includes(doc.data().status)
                    : ['Approved', 'Rejected'].includes(doc.data().status)
            }));

            setNotifications(notes);

            // simplistic unread count: count all relevant items for now
            // In a real app we'd have a separate 'read' status array or subcollection
            setUnreadCount(notes.filter(n => n.isRelevant).length);
            setLoading(false);
        }, (error) => {
            console.error("Notification listener error:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser, userRole]);

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, loading }}>
            {children}
        </NotificationContext.Provider>
    );
};
