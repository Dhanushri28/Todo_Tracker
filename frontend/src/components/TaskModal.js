import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { createTask, updateTask } from '../redux/tasksSlice';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';

export const TaskModal = ({ isOpen, onClose, task, users }) => {
  const dispatch = useDispatch();
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm();

  const isEditing = !!task;

  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description,
        assignee_id: task.assignee_id || 'unassigned',
        status: task.status,
        due_date: task.due_date || '',
      });
    } else {
      reset({
        title: '',
        description: '',
        assignee_id: 'unassigned',
        status: 'todo',
        due_date: '',
      });
    }
  }, [task, reset]);

  const onSubmit = async (data) => {
    try {
      const taskData = {
        ...data,
        assignee_id: data.assignee_id === 'unassigned' ? null : data.assignee_id || null,
        due_date: data.due_date || null,
      };

      if (isEditing) {
        await dispatch(updateTask({ taskId: task.id, taskData })).unwrap();
        toast.success('Task updated successfully');
      } else {
        await dispatch(createTask(taskData)).unwrap();
        toast.success('Task created successfully');
      }
      onClose();
    } catch (error) {
      toast.error(isEditing ? 'Failed to update task' : 'Failed to create task');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]" data-testid="task-modal">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold" data-testid="task-modal-title">
            {isEditing ? 'Edit Task' : 'Create New Task'}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the task details below' : 'Fill in the details to create a new task'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Enter task title"
              {...register('title', { required: 'Title is required' })}
              className="w-full"
              data-testid="task-title-input"
            />
            {errors.title && <p className="text-sm text-red-600">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe the task"
              {...register('description', { required: 'Description is required' })}
              className="w-full min-h-[100px]"
              data-testid="task-description-input"
            />
            {errors.description && <p className="text-sm text-red-600">{errors.description.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignee_id">Assignee</Label>
            <Select 
              value={watch('assignee_id')} 
              onValueChange={(value) => setValue('assignee_id', value)}
            >
              <SelectTrigger className="w-full" data-testid="task-assignee-select">
                <SelectValue placeholder="Select assignee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {users.map(user => (
                  <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Select 
              value={watch('status')} 
              onValueChange={(value) => setValue('status', value)}
            >
              <SelectTrigger className="w-full" data-testid="task-status-select">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="done">Done</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="due_date">Due Date</Label>
            <Input
              id="due_date"
              type="date"
              {...register('due_date')}
              className="w-full"
              data-testid="task-due-date-input"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} data-testid="task-modal-cancel">
              Cancel
            </Button>
            <Button type="submit" className="bg-slate-800 hover:bg-slate-900" data-testid="task-modal-submit">
              {isEditing ? 'Update Task' : 'Create Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskModal;