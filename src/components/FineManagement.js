import { useState, useEffect } from "react";
import axios from "axios";
import { Tooltip } from "react-bootstrap";
import { OverlayTrigger } from "react-bootstrap";
import "./FineManagement.css";

const FineManagement = () => {
    const [fines, setFines] = useState([]);
    const [searchRegNumber, setSearchRegNumber] = useState("");
    const [filteredFines, setFilteredFines] = useState([]);
    const [loadingFineId, setLoadingFineId] = useState(null);

    useEffect(() => {
        fetchFines();
    }, []);

    const fetchFines = async () => {
        try {
            const response = await axios.get("http://localhost:5000/api/fines/unpaid");
            setFines(response.data);
            setFilteredFines(response.data);
        } catch (error) {
            console.error("❌ Error fetching fines:", error.response?.data || error.message);
        }
    };

    const handleSearch = () => {
        if (searchRegNumber.trim() === "") {
            setFilteredFines(fines);
        } else {
            const filtered = fines.filter((fine) =>
                fine.reg_number.toLowerCase().includes(searchRegNumber.toLowerCase())
            );
            setFilteredFines(filtered);
        }
    };

    const markAsPaid = async (fineId) => {
        try {
            setLoadingFineId(fineId);
            await axios.put(`http://localhost:5000/api/fines/pay/${fineId}`);
            fetchFines();
        } catch (error) {
            console.error("❌ Error marking fine as paid:", error.response?.data || error.message);
        } finally {
            setLoadingFineId(null);
        }
    };

    // Tooltip render function
    const renderTooltip = (props) => (
        <Tooltip id="button-tooltip" {...props}>
            Mark this fine as paid
        </Tooltip>
    );

    return (
        <div className="container my-5 fine-management">
            <div className="card shadow-lg border-0">
                <div className="card-header bg-primary text-white d-flex align-items-center">
                    <i className="bi bi-wallet2 me-2"></i>
                    <h2 className="mb-0">Fine Management</h2>
                </div>
                <div className="card-body p-4">
                    {/* Search Bar */}
                    <div className="input-group mb-4">
                        <span className="input-group-text bg-white border-end-0">
                            <i className="bi bi-search"></i>
                        </span>
                        <input
                            type="text"
                            className="form-control border-start-0"
                            placeholder="Search by Registration Number"
                            value={searchRegNumber}
                            onChange={(e) => setSearchRegNumber(e.target.value)}
                        />
                        <button className="btn btn-primary" onClick={handleSearch}>
                            <i className="bi bi-filter me-1"></i> Search
                        </button>
                    </div>

                    {/* Fine List Table */}
                    <div className="table-responsive">
                        <table className="table table-hover table-striped align-middle">
                            <thead className="table-dark">
                                <tr>
                                    <th scope="col">Student Name</th>
                                    <th scope="col">Reg Number</th>
                                    <th scope="col">Book Title</th>
                                    <th scope="col">Due Date</th>
                                    <th scope="col">Fine Amount</th>
                                    <th scope="col">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredFines.length > 0 ? (
                                    filteredFines.map((fine) => (
                                        <tr key={fine.id} className="fade-in">
                                            <td>{fine.student_name || "N/A"}</td>
                                            <td>{fine.reg_number}</td>
                                            <td>{fine.book_title || "Unknown"}</td>
                                            <td>{new Date(fine.due_date).toLocaleDateString("en-GB")}</td>
                                            <td>
                                                ₦
                                                {typeof fine.fine_amount === "number"
                                                    ? fine.fine_amount.toFixed(2)
                                                    : parseFloat(fine.fine_amount || 0).toFixed(2)}
                                            </td>
                                            <td>
                                                <OverlayTrigger
                                                    placement="top"
                                                    delay={{ show: 250, hide: 400 }}
                                                    overlay={renderTooltip}
                                                >
                                                    <button
                                                        className="btn btn-success btn-sm"
                                                        onClick={() => markAsPaid(fine.id)}
                                                        disabled={loadingFineId === fine.id}
                                                    >
                                                        {loadingFineId === fine.id ? (
                                                            <>
                                                                <span
                                                                    className="spinner-border spinner-border-sm me-1"
                                                                    role="status"
                                                                    aria-hidden="true"
                                                                ></span>
                                                                Processing...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <i className="bi bi-check-circle me-1"></i> Mark Paid
                                                            </>
                                                        )}
                                                    </button>
                                                </OverlayTrigger>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center text-muted py-4">
                                            <i className="bi bi-info-circle me-2"></i>
                                            No unpaid fines found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FineManagement;