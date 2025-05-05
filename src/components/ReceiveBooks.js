import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const ReceiveBooks = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState('');
  const [books, setBooks] = useState([]);
  const [comments, setComments] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/orders');
      const data = await response.json();
      if (Array.isArray(data)) {
        setOrders(data);
      } else if (data?.orders && Array.isArray(data.orders)) {
        setOrders(data.orders);
      } else {
        console.error('Unexpected orders format:', data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const loadOrder = async () => {
    if (!selectedOrder) return;
    try {
      const response = await fetch(`http://localhost:5000/api/orders/${selectedOrder}/books`);
      
      if (response.status === 404) {
        alert('No books found for this order. It may have been deleted or not yet added.');
        setBooks([]);  // Clear the books list if any
        return;
      }
  
      if (!response.ok) throw new Error("Failed to fetch order details");
      
      const data = await response.json();
  
      const initializedBooks = data.map(book => ({
        ...book,
        receivedQuantity: book.receivedQuantity ?? book.orderedQuantity ?? 0,
        isDamaged: book.isDamaged ?? false,
      }));
  
      setBooks(initializedBooks);
    } catch (error) {
      console.error('Error loading order books:', error);
    }
  };
  

  const handleConfirmReceipt = async () => {
    if (!selectedOrder) return;

    const receivedBooks = books.map(book => ({
      bookId: book.id,
      receivedQuantity: Number(book.receivedQuantity) || 0,
      isDamaged: Boolean(book.isDamaged),
    }));

    try {
      const response = await fetch(`http://localhost:5000/api/orders/${selectedOrder}/receive`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ receivedBooks, comments }),
      });

      if (response.ok) {
        setSuccessMessage('Books successfully marked as received.');
        setBooks([]);
        setComments('');
        setSelectedOrder('');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        const errorText = await response.text();
        console.error('Error confirming receipt:', errorText);
      }
    } catch (error) {
      console.error('Error during confirmation:', error);
    }
  };

  return (
    <div className="container my-4">
      <h1 className="text-center">Receive Books</h1>

      <div className="mb-4">
        <label htmlFor="orderSelect" className="form-label">Select Order</label>
        <select
          id="orderSelect"
          className="form-select"
          value={selectedOrder}
          onChange={(e) => setSelectedOrder(e.target.value)}
        >
          <option value="">-- Select an Order --</option>
          {orders.length > 0 ? (
            orders.map(order => (
              <option key={order.id} value={order.id}>
                {order.id} - {order.vendorName}
              </option>
            ))
          ) : (
            <option disabled>No orders available</option>
          )}
        </select>
        <button className="btn btn-primary mt-2" onClick={loadOrder} disabled={!selectedOrder}>
          Load Order
        </button>
      </div>

      {books.length > 0 && (
        <div className="mb-4">
          <h2>Books in Order</h2>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Book Title</th>
                  <th>Ordered Quantity</th>
                  <th>Received Quantity</th>
                  <th>ISBN</th>
                  <th>Vendor</th>
                  <th>Damaged</th>
                </tr>
              </thead>
              <tbody>
                {books.map((book, index) => (
                  <tr key={book.id}>
                    <td>{book.title}</td>
                    <td>{book.orderedQuantity}</td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        max={book.orderedQuantity}
                        value={book.receivedQuantity}
                        onChange={(e) => {
                          const updatedBooks = [...books];
                          updatedBooks[index].receivedQuantity = Math.max(0, parseInt(e.target.value) || 0);
                          setBooks(updatedBooks);
                        }}
                        className="form-control"
                      />
                    </td>
                    <td>{book.isbn}</td>
                    <td>{book.vendor}</td>
                    <td>
                      <input
                        type="checkbox"
                        checked={book.isDamaged}
                        onChange={(e) => {
                          const updatedBooks = [...books];
                          updatedBooks[index].isDamaged = e.target.checked;
                          setBooks(updatedBooks);
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <textarea
            className="form-control mt-2"
            placeholder="Notes about the delivery, damage, or discrepancies."
            value={comments}
            onChange={(e) => setComments(e.target.value)}
          />
        </div>
      )}

      <div className="text-center">
        <button
          className="btn btn-success mt-3"
          onClick={handleConfirmReceipt}
          disabled={!selectedOrder || books.length === 0}
        >
          Confirm Receipt
        </button>
        {successMessage && <div className="alert alert-success mt-4">{successMessage}</div>}
      </div>
    </div>
  );
};

export default ReceiveBooks;