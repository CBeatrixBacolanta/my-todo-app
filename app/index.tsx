import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import axios from 'axios';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LoadingScreen from '@/components/loadingScreen';

const BASE_URL = "https://backend-fapi.onrender.com";

interface Todo {  
  id: number;
  title: string;
  completed: boolean;
}

const App = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [task, setTask] = useState('');
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [darkMode, setDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 3000);
  }, []);

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/todos`);
      setTodos(response.data);
    } catch (err) {
      console.error("Fetch error", err);
    }
  };

  const addTask = async () => {
    if (!task.trim()) return;
    try {
      const response = await axios.post(`${BASE_URL}/todos`, { title: task });
      setTodos([...todos, response.data]);
      setTask('');
    } catch (err) {
      console.error("Add error", err);
    }
  };

  const removeTask = async (id: number) => {
    try {
      await axios.delete(`${BASE_URL}/todos/${id}`);
      setTodos(todos.filter(todo => todo.id !== id));
    } catch (err) {
      console.error("Delete error", err);
    }
  };

  const toggleComplete = async (id: number) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    try {
      const response = await axios.put(`${BASE_URL}/todos/${id}`, {
        title: todo.title,
        completed: !todo.completed
      });
      setTodos(todos.map(t => t.id === id ? response.data : t));
    } catch (err) {
      console.error("Update error", err);
    }
  };

  const saveEdit = async (id: number) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    try {
      const response = await axios.put(`${BASE_URL}/todos/${id}`, {
        title: editText,
        completed: todo.completed
      });
      setTodos(todos.map(t => t.id === id ? response.data : t));
      setEditIndex(null);
    } catch (err) {
      console.error("Save edit error", err);
    }
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === 'completed') return todo.completed;
    if (filter === 'pending') return !todo.completed;
    return true;
  });

  if (isLoading) {
    return <LoadingScreen />
  } else {
    return (
      <SafeAreaProvider>
        <StatusBar style='light' backgroundColor='black' />
        <SafeAreaView style={[styles.container, darkMode && styles.dark]}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
          >
            <View style={[styles.header, darkMode && styles.darkHeader]}>
              <Text style={[styles.heading, darkMode && styles.darkHeading]}>My Todo List</Text>
              <TouchableOpacity
                style={[styles.darkModeToggle, { backgroundColor: darkMode ? '#06ad99' : '#C39EA0' }]}
                onPress={() => setDarkMode(!darkMode)}
              >
                <MaterialCommunityIcons
                  name={darkMode ? 'weather-sunny' : 'weather-night'}
                  size={30}
                  color={darkMode ? 'yellow' : 'black'}
                />
              </TouchableOpacity>
            </View>
  
            <Text style={[styles.subHeading, { color: darkMode ? 'white' : '#C73987' }]}>
              Manage Your Tasks
            </Text>
            <TextInput
              placeholder="Add a new task..."
              value={task}
              onChangeText={setTask}
              style={styles.input}
              placeholderTextColor="#999"
            />
            <TouchableOpacity style={styles.addButton} onPress={addTask}>
              <Text style={styles.addButtonText}>Add Task</Text>
            </TouchableOpacity>
            <View style={styles.filterRow}>
              <TouchableOpacity style={[styles.filterButton, { backgroundColor: '#00BFA6' }]} onPress={() => setFilter('all')}>
                <Text style={styles.filterButtonText}>All</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.filterButton, { backgroundColor: '#007AFF' }]} onPress={() => setFilter('completed')}>
                <Text style={styles.filterButtonText}>Completed</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.filterButton, { backgroundColor: '#FF6F00' }]} onPress={() => setFilter('pending')}>
                <Text style={styles.filterButtonText}>Pending</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={filteredTodos}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={{ paddingBottom: 100 }}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <View style={styles.taskCard}>
                  <TouchableOpacity onPress={() => toggleComplete(item.id)}>
                    <Text style={{ fontSize: 18 }}>{item.completed ? '✅' : '⬜'}</Text>
                  </TouchableOpacity>
                  {editIndex === item.id ? (
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <TextInput
                        value={editText}
                        onChangeText={setEditText}
                        style={styles.editInput}
                        placeholder="Edit task"
                        placeholderTextColor="#aaa"
                      />
                      <View style={{ flexDirection: 'row', marginTop: 8, gap: 12 }}>
                        <TouchableOpacity onPress={() => saveEdit(item.id)}>
                          <Text style={{ color: 'white' }}>Save</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setEditIndex(null)}>
                          <Text style={{ color: 'white' }}>Cancel</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <>
                      <Text style={[styles.taskText, item.completed && styles.completed]}>
                        {item.title}
                      </Text>
                      <View style={{ flexDirection: 'row', marginLeft: 10 }}>
                        <TouchableOpacity
                          onPress={() => {
                            setEditIndex(item.id);
                            setEditText(item.title);
                          }}
                          style={styles.iconButton}
                        >
                          <MaterialCommunityIcons name="pencil" size={24} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => removeTask(item.id)}
                          style={styles.iconButton}
                        >
                          <MaterialCommunityIcons name="trash-can-outline" size={24} color="white" />
                        </TouchableOpacity>
                      </View>
                    </>
                  )}
                </View>
              )}
            />
          </KeyboardAvoidingView>
        </SafeAreaView>
      </SafeAreaProvider>
    );    
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  dark: {
    backgroundColor: '#1e1e2e',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: 'white',
  },
  darkHeader: {
    backgroundColor: '#ff1f2f3',
  },
  heading: {
    color: '#C73987',
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 28,
    fontWeight: 'bold',
  },
  darkHeading: {
    color: 'white',
  },
  subHeading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'pink',
    marginVertical: 10,
    backgroundColor: 'white',
    width: '100%',
  },
  editInput: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
  },
  addButton: {
    backgroundColor: '#00BCD4',
    padding: 13,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 15,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  filterButton: {
    padding: 10,
    borderRadius: 25,
    alignItems: 'center',
    width: '30%',
  },
  filterButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#424955',
    padding: 17,
    borderRadius: 8,
    marginVertical: 10,
    width: '100%',
    alignSelf: 'center',
  },
  taskText: {
    flex: 1,
    fontSize: 17,
    color: 'white',
    marginLeft: 10,
  },
  completed: {
    textDecorationLine: 'line-through',
    color: '#999999',
  },
  darkModeToggle: {
    padding: 10,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  darkModeText: {
    color: 'white',
    fontWeight: 'bold',
  },
  iconButton: {
    padding: 4,
    marginHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;