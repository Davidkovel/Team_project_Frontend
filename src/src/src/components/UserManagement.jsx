import React, { useState } from 'react';

const UserManagement = () => {
    // Початковий список користувачів (імітація бази даних)
    const [users, setUsers] = useState([
        { id: 1, name: "Олександр", status: "Active" },
        { id: 2, name: "Дмитро", status: "Active" },
        { id: 3, name: "Анна", status: "Blocked" },
    ]);

    const deleteUser = (id) => {
        if (window.confirm("Видалити користувача?")) {
            setUsers(users.filter(user => user.id !== id));
        }
    };

    const toggleBlock = (id) => {
        setUsers(users.map(user => {
            if (user.id === id) {
                return { ...user, status: user.status === "Active" ? "Blocked" : "Active" };
            }
            return user;
        }));
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Керування користувачами</h2>
            <table border="1" cellPadding="10" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                <tr style={{ backgroundColor: '#eee' }}>
                    <th>ID</th>
                    <th>Ім'я</th>
                    <th>Статус</th>
                    <th>Дії</th>
                </tr>
                </thead>
                <tbody>
                {users.map(user => (
                    <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>{user.name}</td>
                        <td style={{ color: user.status === "Blocked" ? "red" : "green" }}>{user.status}</td>
                        <td>
                            <button onClick={() => toggleBlock(user.id)}>
                                {user.status === "Active" ? "Заблокувати" : "Розблокувати"}
                            </button>
                            <button onClick={() => deleteUser(user.id)} style={{ marginLeft: '10px', color: 'red' }}>
                                Видалити
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default UserManagement;