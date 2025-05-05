import React, { useState } from "react";

export default function ClassificationCategories() {
    const [categories, setCategories] = useState([
        { id: 1, name: "Science Fiction" },
        { id: 2, name: "History" },
    ]);
    const [newCategory, setNewCategory] = useState("");

    const addCategory = () => {
        if (newCategory.trim()) {
            setCategories([...categories, { id: categories.length + 1, name: newCategory }]);
            setNewCategory("");
        }
    };

    return (
        <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Classification & Categories</h2>
            <div className="bg-white shadow-md rounded-lg p-4">
                <div className="flex gap-2 mb-4">
                    <input
                        type="text"
                        placeholder="Enter category name"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className="border p-2 rounded w-full"
                    />
                    <button onClick={addCategory} className="bg-blue-500 text-white px-4 py-2 rounded">
                        Add Category
                    </button>
                </div>
                <table className="w-full border-collapse border border-gray-300">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border border-gray-300 px-4 py-2">ID</th>
                            <th className="border border-gray-300 px-4 py-2">Name</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map((category) => (
                            <tr key={category.id} className="text-center">
                                <td className="border border-gray-300 px-4 py-2">{category.id}</td>
                                <td className="border border-gray-300 px-4 py-2">{category.name}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
