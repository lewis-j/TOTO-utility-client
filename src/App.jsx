import { useState, useEffect } from "react";
import axios from "axios";
import {
  FaList,
  FaPlus,
  FaTrash,
  FaCheck,
  FaMicrosoft,
  FaTimes,
} from "react-icons/fa";
import "./App.css";
const dev_URL = import.meta.env.VITE_API_URL_DEV;
const prod_URL = import.meta.env.VITE_API_URL;

const API_URL = prod_URL ? prod_URL : dev_URL || "http://localhost:3001";

function Sidebar({ lists, onCreateList, onSelectList, selectedListId }) {
  const [newListName, setNewListName] = useState("");

  const handleCreateList = () => {
    if (newListName.trim()) {
      onCreateList(newListName);
      setNewListName("");
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>
          <FaList /> My Lists
        </h2>
      </div>
      <div className="new-list-form">
        <input
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
          placeholder="New list name"
        />
        <button onClick={handleCreateList}>
          <FaPlus />
        </button>
      </div>
      <ul className="list-menu">
        {lists.map((list) => (
          <li
            key={list._id}
            className={list._id === selectedListId ? "active" : ""}
            onClick={() => onSelectList(list._id)}
          >
            <FaList /> {list.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

function MainContent({
  selectedList,
  onAddItem,
  onRemoveItem,
  onToggleSelect,
  selectedItems,
}) {
  const [newItemName, setNewItemName] = useState("");

  const handleAddItem = () => {
    if (newItemName.trim()) {
      onAddItem(selectedList._id, newItemName);
      setNewItemName("");
    }
  };

  return (
    <div className="main-content">
      <h2>{selectedList ? selectedList.name : "Select a list"}</h2>
      {selectedList && (
        <>
          <div className="new-item-form">
            <input
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="Add new item"
            />
            <button onClick={handleAddItem}>
              <FaPlus />
            </button>
          </div>
          <ul className="item-list">
            {selectedList.items.map((item) => (
              <li key={item._id}>
                <div className="item-content">
                  <button
                    className={`checkbox ${
                      selectedItems.some((i) => i._id === item._id)
                        ? "checked"
                        : ""
                    }`}
                    onClick={() => onToggleSelect(item)}
                  >
                    {selectedItems.some((i) => i._id === item._id) && (
                      <FaCheck />
                    )}
                  </button>
                  <span>{item.name}</span>
                </div>
                <button
                  className="remove-btn"
                  onClick={() => onRemoveItem(selectedList._id, item._id)}
                >
                  <FaTrash />
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function SelectedItemsPanel({ selectedItems, onRemoveSelectedItem }) {
  return (
    <div className="selected-items-panel">
      <h2>Selected Items</h2>
      <ul className="selected-item-list">
        {selectedItems.map((item) => (
          <li key={item._id}>
            <span>{item.name}</span>
            <button onClick={() => onRemoveSelectedItem(item)}>
              <FaTimes />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MicrosoftTodoIntegration({ selectedItems }) {
  const [todoLists, setTodoLists] = useState([]);
  const [selectedTodoList, setSelectedTodoList] = useState("");

  useEffect(() => {
    fetchTodoLists();
  }, []);

  const fetchTodoLists = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/todo/lists`, {
        withCredentials: true,
      });
      setTodoLists(response.data);
    } catch (error) {
      console.error("Error fetching To Do lists:", error);
    }
  };

  const addItemsToTodoList = async () => {
    if (!selectedTodoList) {
      alert("Please select a To Do list");
      return;
    }

    try {
      await axios.post(
        `${API_URL}/todo/lists/${selectedTodoList}/tasks`,
        {
          items: selectedItems,
        },
        { withCredentials: true }
      );
      alert("Items added to Microsoft To Do successfully!");
    } catch (error) {
      console.error("Error adding items to To Do list:", error);
      alert("Failed to add items to To Do list. Please try again.");
    }
  };

  return (
    <div className="microsoft-todo-integration">
      <h3>
        <FaMicrosoft /> Microsoft To Do Integration
      </h3>
      <select
        value={selectedTodoList}
        onChange={(e) => setSelectedTodoList(e.target.value)}
      >
        <option value="">Select a To Do list</option>
        {todoLists.map((list) => (
          <option key={list.id} value={list.id}>
            {list.displayName}
          </option>
        ))}
      </select>
      <button
        onClick={addItemsToTodoList}
        disabled={selectedItems.length === 0}
      >
        Add Selected Items to Microsoft To Do
      </button>
    </div>
  );
}

function App() {
  const [lists, setLists] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedListId, setSelectedListId] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
    fetchLists();
  }, []);

  const checkAuthStatus = async () => {
    try {
      await axios.get(`${API_URL}/api/todo/lists`, { withCredentials: true });
      setIsAuthenticated(true);
    } catch (error) {
      console.error(error);
      setIsAuthenticated(false);
    }
  };

  const handleLogin = () => {
    window.location.href = `${API_URL}/auth/login`;
  };

  const fetchLists = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/lists`);
      setLists(response.data);
    } catch (error) {
      console.error(
        "Error fetching lists:",
        error.response?.data || error.message
      );
      alert("Failed to fetch lists. Please try again.");
    }
  };

  const createList = async (name) => {
    try {
      await axios.post(`${API_URL}/api/lists`, { name });
      fetchLists();
    } catch (error) {
      console.error(
        "Error creating list:",
        error.response?.data || error.message
      );
      alert("Failed to create list. Please try again.");
    }
  };

  const addItemToList = async (listId, itemName) => {
    try {
      await axios.post(`${API_URL}/api/lists/${listId}/items`, {
        name: itemName,
      });
      fetchLists();
    } catch (error) {
      console.error(
        "Error adding item:",
        error.response?.data || error.message
      );
      alert("Failed to add item. Please try again.");
    }
  };

  const removeItemFromList = async (listId, itemId) => {
    try {
      await axios.delete(`${API_URL}/api/lists/${listId}/items/${itemId}`);
      fetchLists();
    } catch (error) {
      console.error(
        "Error removing item:",
        error.response?.data || error.message
      );
      alert("Failed to remove item. Please try again.");
    }
  };

  const toggleItemSelection = (item) => {
    setSelectedItems((prev) =>
      prev.some((i) => i._id === item._id)
        ? prev.filter((i) => i._id !== item._id)
        : [...prev, item]
    );
  };

  const removeSelectedItem = (item) => {
    setSelectedItems((prev) => prev.filter((i) => i._id !== item._id));
  };

  const selectedList = lists.find((list) => list._id === selectedListId);

  return (
    <div className="App">
      <Sidebar
        lists={lists}
        onCreateList={createList}
        onSelectList={setSelectedListId}
        selectedListId={selectedListId}
      />
      <div className="main-container">
        <MainContent
          selectedList={selectedList}
          onAddItem={addItemToList}
          onRemoveItem={removeItemFromList}
          onToggleSelect={toggleItemSelection}
          selectedItems={selectedItems}
        />
        <SelectedItemsPanel
          selectedItems={selectedItems}
          onRemoveSelectedItem={removeSelectedItem}
        />
      </div>
      <div className="footer">
        {isAuthenticated ? (
          <MicrosoftTodoIntegration selectedItems={selectedItems} />
        ) : (
          <button onClick={handleLogin}>Login with Microsoft</button>
        )}
      </div>
    </div>
  );
}

export default App;
