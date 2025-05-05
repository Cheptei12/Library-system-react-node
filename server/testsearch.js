const pool = require("./config/db"); // Adjust this path if it's incorrect  

async function testSearch(query) {  
    try {  
        const connection = await pool.getConnection(); // Get a connection from the pool  
        try {  
            const searchQuery = `%${query}%`;  
            const [books] = await connection.query(  
                "SELECT * FROM books WHERE title LIKE ? OR author LIKE ? OR category LIKE ?",  
                [searchQuery, searchQuery, searchQuery]  
            );  
            console.log("Search Results:", books);  
        } catch (error) {  
            console.error("Error during query:", error);  
        } finally {  
            connection.release(); // Release the connection back to the pool  
        }  
    } catch (poolError) {  
        console.error("Error getting connection from pool:", poolError);  
    }  
}  

testSearch("science");