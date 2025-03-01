const fs = require("node:fs/promises");
const path = require("node:path");
const lockfile = require("lockfile");

const lockPath = path.join(__dirname, "file.lock");

// Acquire a lock
const acquireLock = async () => {
    return new Promise((resolve, reject) => {
        lockfile.lock(lockPath, { retries: 10, retryWait: 100 }, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
};

// Release a lock
const releaseLock = async () => {
    return new Promise((resolve, reject) => {
        lockfile.unlock(lockPath, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
};

// Read JSON file safely
const readJSONFile = async (filePath) => {
    try {
        const data = await fs.readFile(filePath, "utf8");
        if (!data) return [];
        const jsonArray = JSON.parse(data);
        if (!Array.isArray(jsonArray)) {
            throw new Error("JSON file does not contain an array.");
        }
        return jsonArray;
    } catch (err) {
        if (err.code === "ENOENT") {
            return []; // Initialize if file does not exist
        }
        throw err;
    }
};

// Write JSON file safely
const writeJSONFile = async (filePath, data) => {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
};

exports.updateOrAddObject = async (filePath, newObj) => {
	try {
			await acquireLock();

			let jsonArray = await readJSONFile(filePath);

			let index = jsonArray.findIndex((obj) => obj.phone === newObj.phone);

			if (index !== -1) {
					jsonArray[index] = { ...jsonArray[index], ...newObj };
					console.log(`Updated object at index ${index}`);
			} else {
					jsonArray.push(newObj);
					console.log("Added new object");
			}

			await writeJSONFile(filePath, jsonArray);
			console.log("File updated successfully!");
	} catch (err) {
			console.error("Error handling file:", err);
	} finally {
			await releaseLock();
	}
};

exports.deleteObject = async (filePath, keyToDelete) => {
	try {
			await acquireLock();

			let jsonArray = await readJSONFile(filePath);

			// Delete the key from each object in the array
			const filteredArray = jsonArray.map((obj) => {
					if (obj.hasOwnProperty(keyToDelete)) {
							delete obj[keyToDelete];
					}
					return obj;
			});

			await writeJSONFile(filePath, filteredArray);
			console.log("File updated after deletion successfully!");
	} catch (err) {
			if (err.code === "ENOENT") {
					console.log("File not found.");
			} else {
					console.error("Error:", err);
			}
	} finally {
			await releaseLock();
	}
};