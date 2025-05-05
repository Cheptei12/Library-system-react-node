import React, { useState, useEffect } from "react";
import { Button, Card, Form, Table, Modal, Alert } from "react-bootstrap";
import axios from "axios";

const VendorManagement = () => {
  const [vendors, setVendors] = useState([]);
  const [newVendor, setNewVendor] = useState({
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    website: "",
    specialties: [],
  });
  const [showModal, setShowModal] = useState(false);
  const [editVendor, setEditVendor] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/vendors");
        setVendors(response.data);
      } catch (error) {
        console.error("Error fetching vendors:", error);
        setError("Failed to fetch vendor data.");
      }
    };
    fetchVendors();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newVendor.name || !newVendor.contactPerson || !newVendor.email || !newVendor.phone || !newVendor.address) {
      setError("Please fill in all the required fields (Name, Contact Person, Email, Phone, and Address).");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/vendors", {
        name: newVendor.name,
        contact_person: newVendor.contactPerson, // Match backend key
        email: newVendor.email,
        phone: newVendor.phone,
        address: newVendor.address,
        website: newVendor.website,
        specialties: JSON.stringify(newVendor.specialties),
      });
      setVendors([...vendors, { ...newVendor, vendor_id: response.data.vendorId, contact_person: newVendor.contactPerson }]);
      setNewVendor({
        name: "",
        contactPerson: "",
        email: "",
        phone: "",
        address: "",
        website: "",
        specialties: [],
      });
    } catch (error) {
      console.error("Error adding vendor:", error);
      setError("Failed to add vendor.");
    }
  };

  const handleDelete = async (vendorId) => {
    try {
      await axios.delete(`http://localhost:5000/api/vendors/${vendorId}`);
      setVendors(vendors.filter((vendor) => vendor.vendor_id !== vendorId));
    } catch (error) {
      console.error("Error deleting vendor:", error);
      setError("Failed to delete vendor.");
    }
  };

  const handleEdit = (vendor) => {
    setEditVendor(vendor);
    setShowModal(true);
  };

  const handleModalClose = () => setShowModal(false);

  const handleModalSave = async () => {
    try {
      await axios.put(`http://localhost:5000/api/vendors/${editVendor.vendor_id}`, {
        name: editVendor.name,
        contact_person: editVendor.contact_person, // Match backend key
        email: editVendor.email,
        phone: editVendor.phone,
        address: editVendor.address,
        website: editVendor.website,
        specialties: JSON.stringify(editVendor.specialties),
      });
      setVendors(vendors.map((vendor) => (vendor.vendor_id === editVendor.vendor_id ? editVendor : vendor)));
      setShowModal(false);
    } catch (error) {
      console.error("Error updating vendor:", error);
      setError("Failed to update vendor.");
    }
  };

  return (
    <div>
      <h1 className="text-center my-4">Vendor Management</h1>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="mb-4">
        <Card.Body>
          <h3>Add New Vendor</h3>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="vendorName">
              <Form.Label>Vendor Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter vendor name"
                value={newVendor.name}
                onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })}
              />
            </Form.Group>

            <Form.Group controlId="contactPerson" className="mt-3">
              <Form.Label>Contact Person</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter contact person"
                value={newVendor.contactPerson}
                onChange={(e) => setNewVendor({ ...newVendor, contactPerson: e.target.value })}
              />
            </Form.Group>

            <Form.Group controlId="email" className="mt-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                value={newVendor.email}
                onChange={(e) => setNewVendor({ ...newVendor, email: e.target.value })}
              />
            </Form.Group>

            <Form.Group controlId="phone" className="mt-3">
              <Form.Label>Phone Number</Form.Label>
              <Form.Control
                type="tel"
                placeholder="Enter phone number"
                value={newVendor.phone}
                onChange={(e) => setNewVendor({ ...newVendor, phone: e.target.value })}
              />
            </Form.Group>

            <Form.Group controlId="address" className="mt-3">
              <Form.Label>Address</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter address"
                value={newVendor.address}
                onChange={(e) => setNewVendor({ ...newVendor, address: e.target.value })}
              />
            </Form.Group>

            <Form.Group controlId="website" className="mt-3">
              <Form.Label>Company Website</Form.Label>
              <Form.Control
                type="url"
                placeholder="Enter company website"
                value={newVendor.website}
                onChange={(e) => setNewVendor({ ...newVendor, website: e.target.value })}
              />
            </Form.Group>

            <Form.Group controlId="specialties" className="mt-3">
              <Form.Label>Specialties</Form.Label>
              <Form.Check
                type="checkbox"
                label="Textbooks"
                checked={newVendor.specialties.includes("Textbooks")}
                onChange={() =>
                  setNewVendor({
                    ...newVendor,
                    specialties: newVendor.specialties.includes("Textbooks")
                      ? newVendor.specialties.filter((s) => s !== "Textbooks")
                      : [...newVendor.specialties, "Textbooks"],
                  })
                }
              />
              <Form.Check
                type="checkbox"
                label="Journals"
                checked={newVendor.specialties.includes("Journals")}
                onChange={() =>
                  setNewVendor({
                    ...newVendor,
                    specialties: newVendor.specialties.includes("Journals")
                      ? newVendor.specialties.filter((s) => s !== "Journals")
                      : [...newVendor.specialties, "Journals"],
                  })
                }
              />
              <Form.Check
                type="checkbox"
                label="eBooks"
                checked={newVendor.specialties.includes("eBooks")}
                onChange={() =>
                  setNewVendor({
                    ...newVendor,
                    specialties: newVendor.specialties.includes("eBooks")
                      ? newVendor.specialties.filter((s) => s !== "eBooks")
                      : [...newVendor.specialties, "eBooks"],
                  })
                }
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="mt-3">
              Add Vendor
            </Button>
          </Form>
        </Card.Body>
      </Card>

      <h3>Registered Vendors</h3>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Vendor Name</th>
            <th>Contact Person</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Specialties</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {vendors.map((vendor) => (
            <tr key={vendor.vendor_id}>
              <td>{vendor.name}</td>
              <td>{vendor.contact_person}</td>
              <td>{vendor.email}</td>
              <td>{vendor.phone}</td>
              <td>{vendor.specialties.join(", ")}</td>
              <td>
                <Button
                  variant="warning"
                  size="sm"
                  onClick={() => handleEdit(vendor)}
                  className="me-2"
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(vendor.vendor_id)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Vendor</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="vendorName">
              <Form.Label>Vendor Name</Form.Label>
              <Form.Control
                type="text"
                value={editVendor?.name}
                onChange={(e) => setEditVendor({ ...editVendor, name: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="contactPerson" className="mt-3">
              <Form.Label>Contact Person</Form.Label>
              <Form.Control
                type="text"
                value={editVendor?.contact_person}
                onChange={(e) =>
                  setEditVendor({ ...editVendor, contact_person: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group controlId="email" className="mt-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={editVendor?.email}
                onChange={(e) => setEditVendor({ ...editVendor, email: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="phone" className="mt-3">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                type="tel"
                value={editVendor?.phone}
                onChange={(e) => setEditVendor({ ...editVendor, phone: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="specialties" className="mt-3">
              <Form.Label>Specialties</Form.Label>
              <Form.Check
                type="checkbox"
                label="Textbooks"
                checked={editVendor?.specialties.includes("Textbooks")}
                onChange={() =>
                  setEditVendor({
                    ...editVendor,
                    specialties: editVendor?.specialties.includes("Textbooks")
                      ? editVendor.specialties.filter((s) => s !== "Textbooks")
                      : [...editVendor.specialties, "Textbooks"],
                  })
                }
              />
              <Form.Check
                type="checkbox"
                label="Journals"
                checked={editVendor?.specialties.includes("Journals")}
                onChange={() =>
                  setEditVendor({
                    ...editVendor,
                    specialties: editVendor?.specialties.includes("Journals")
                      ? editVendor.specialties.filter((s) => s !== "Journals")
                      : [...editVendor.specialties, "Journals"],
                  })
                }
              />
              <Form.Check
                type="checkbox"
                label="eBooks"
                checked={editVendor?.specialties.includes("eBooks")}
                onChange={() =>
                  setEditVendor({
                    ...editVendor,
                    specialties: editVendor?.specialties.includes("eBooks")
                      ? editVendor.specialties.filter((s) => s !== "eBooks")
                      : [...editVendor.specialties, "eBooks"],
                  })
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleModalClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleModalSave}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default VendorManagement;