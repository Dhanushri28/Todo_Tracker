import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTasks, deleteTask } from '../redux/tasksSlice';
import { fetchUsers } from '../redux/usersSlice';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import TaskModal from '../components/TaskModal';
import UserModal from '../components/UserModal';
import { Plus, Users, ListTodo, Trash2, Edit, Calendar, User } from 'lucide-react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

const Dashboard = () => {
  const dispatch = useDispatch();
  const tasks = useSelector((state) => state.tasks.items);
  const users = useSelector((state) => state.users.items);
  const loading = useSelector((state) => state.tasks.loading);
  
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterAssignee, setFilterAssignee] = useState('all');

  useEffect(() => {
    dispatch(fetchUsers());
    loadTasks();
  }, []);

  const loadTasks = () => {
    const filters = {};
    if (filterStatus !== 'all') filters.status = filterStatus;
    if (filterAssignee !== 'all') filters.assignee_id = filterAssignee;
    dispatch(fetchTasks(filters));
  };

  useEffect(() => {
    loadTasks();
  }, [filterStatus, filterAssignee]);

  const handleDeleteTask = async (taskId) => {
    try {
      await dispatch(deleteTask(taskId)).unwrap();
      toast.success('Task deleted successfully');
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleCloseTaskModal = () => {
    setIsTaskModalOpen(false);
    setEditingTask(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'todo': return 'bg-slate-100 text-slate-700 hover:bg-slate-200';
      case 'in-progress': return 'bg-blue-100 text-blue-700 hover:bg-blue-200';
      case 'done': return 'bg-green-100 text-green-700 hover:bg-green-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'todo': return 'To Do';
      case 'in-progress': return 'In Progress';
      case 'done': return 'Done';
      default: return status;
    }
  };

  const stats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    done: tasks.filter(t => t.status === 'done').length,
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)' }}>
      <div className="max-w-7xl mx-auto p-6 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-3" style={{ fontFamily: 'Space Grotesk' }}>
            Task Tracker
          </h1>
          <p className="text-slate-600 text-lg">Manage your tasks efficiently and stay organized</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm" data-testid="stats-total">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Tasks</p>
                  <p className="text-3xl font-bold text-slate-800 mt-1">{stats.total}</p>
                </div>
                <div className="p-3 bg-slate-100 rounded-lg">
                  <ListTodo className="w-6 h-6 text-slate-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm" data-testid="stats-todo">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">To Do</p>
                  <p className="text-3xl font-bold text-slate-700 mt-1">{stats.todo}</p>
                </div>
                <div className="p-3 bg-slate-100 rounded-lg">
                  <ListTodo className="w-6 h-6 text-slate-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm" data-testid="stats-in-progress">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">In Progress</p>
                  <p className="text-3xl font-bold text-blue-700 mt-1">{stats.inProgress}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <ListTodo className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm" data-testid="stats-done">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Completed</p>
                  <p className="text-3xl font-bold text-green-700 mt-1">{stats.done}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <ListTodo className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 items-start sm:items-center justify-between">
          <div className="flex gap-3 flex-wrap">
            <Button 
              onClick={() => setIsTaskModalOpen(true)} 
              className="bg-slate-800 hover:bg-slate-900 text-white shadow-lg"
              data-testid="add-task-button"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
            <Button 
              onClick={() => setIsUserModalOpen(true)} 
              variant="outline" 
              className="border-slate-300 hover:bg-slate-100"
              data-testid="add-user-button"
            >
              <Users className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </div>

          <div className="flex gap-3 flex-wrap">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[160px] bg-white" data-testid="filter-status">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="done">Done</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterAssignee} onValueChange={setFilterAssignee}>
              <SelectTrigger className="w-[180px] bg-white" data-testid="filter-assignee">
                <SelectValue placeholder="Assignee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Assignees</SelectItem>
                {users.map(user => (
                  <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tasks Grid */}
        {loading ? (
          <div className="text-center py-12 text-slate-600">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm" data-testid="no-tasks-message">
            <CardContent className="p-12 text-center">
              <ListTodo className="w-16 h-16 mx-auto text-slate-400 mb-4" />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">No tasks yet</h3>
              <p className="text-slate-500 mb-6">Create your first task to get started</p>
              <Button onClick={() => setIsTaskModalOpen(true)} className="bg-slate-800 hover:bg-slate-900">
                <Plus className="w-4 h-4 mr-2" />
                Create Task
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="tasks-grid">
            {tasks.map((task) => (
              <Card 
                key={task.id} 
                className="border-none shadow-md hover:shadow-xl bg-white/90 backdrop-blur-sm transition-shadow duration-300"
                data-testid={`task-card-${task.id}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-lg font-semibold text-slate-800 line-clamp-2" data-testid={`task-title-${task.id}`}>
                      {task.title}
                    </CardTitle>
                    <Badge className={`${getStatusColor(task.status)} border-none`} data-testid={`task-status-${task.id}`}>
                      {getStatusLabel(task.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-slate-600 mb-4 line-clamp-3" data-testid={`task-description-${task.id}`}>
                    {task.description}
                  </CardDescription>
                  
                  <div className="space-y-2 mb-4">
                    {task.assignee_name && (
                      <div className="flex items-center text-sm text-slate-600" data-testid={`task-assignee-${task.id}`}>
                        <User className="w-4 h-4 mr-2" />
                        {task.assignee_name}
                      </div>
                    )}
                    {task.due_date && (
                      <div className="flex items-center text-sm text-slate-600" data-testid={`task-due-date-${task.id}`}>
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(task.due_date).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-slate-200">
                    <Button 
                      onClick={() => handleEditTask(task)} 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
                      data-testid={`edit-task-${task.id}`}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      onClick={() => handleDeleteTask(task.id)} 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                      data-testid={`delete-task-${task.id}`}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <TaskModal 
        isOpen={isTaskModalOpen} 
        onClose={handleCloseTaskModal} 
        task={editingTask}
        users={users}
      />
      <UserModal 
        isOpen={isUserModalOpen} 
        onClose={() => setIsUserModalOpen(false)}
      />
    </div>
  );
};

export default Dashboard;