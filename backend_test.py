import requests
import sys
import json
from datetime import datetime

class TaskTrackerAPITester:
    def __init__(self, base_url="https://mern-tasks.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.created_users = []
        self.created_tasks = []

    def run_test(self, name, method, endpoint, expected_status, data=None, params=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PATCH':
                response = requests.patch(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Error: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        return self.run_test("Root API", "GET", "", 200)

    def test_create_user(self, name, email):
        """Test user creation"""
        success, response = self.run_test(
            f"Create User - {name}",
            "POST",
            "users",
            200,
            data={"name": name, "email": email}
        )
        if success and 'id' in response:
            self.created_users.append(response)
            return response['id']
        return None

    def test_get_users(self):
        """Test getting all users"""
        success, response = self.run_test(
            "Get All Users",
            "GET",
            "users",
            200
        )
        return success, response

    def test_create_task(self, title, description, assignee_id=None, status="todo", due_date=None):
        """Test task creation"""
        task_data = {
            "title": title,
            "description": description,
            "status": status
        }
        if assignee_id:
            task_data["assignee_id"] = assignee_id
        if due_date:
            task_data["due_date"] = due_date

        success, response = self.run_test(
            f"Create Task - {title}",
            "POST",
            "tasks",
            200,
            data=task_data
        )
        if success and 'id' in response:
            self.created_tasks.append(response)
            return response['id']
        return None

    def test_get_tasks(self, status=None, assignee_id=None):
        """Test getting tasks with optional filters"""
        params = {}
        if status:
            params['status'] = status
        if assignee_id:
            params['assignee_id'] = assignee_id
        
        filter_desc = []
        if status:
            filter_desc.append(f"status={status}")
        if assignee_id:
            filter_desc.append(f"assignee_id={assignee_id}")
        
        test_name = f"Get Tasks{' with filters: ' + ', '.join(filter_desc) if filter_desc else ''}"
        
        success, response = self.run_test(
            test_name,
            "GET",
            "tasks",
            200,
            params=params
        )
        return success, response

    def test_get_task_by_id(self, task_id):
        """Test getting a specific task"""
        success, response = self.run_test(
            f"Get Task by ID - {task_id}",
            "GET",
            f"tasks/{task_id}",
            200
        )
        return success, response

    def test_update_task(self, task_id, update_data):
        """Test task update"""
        success, response = self.run_test(
            f"Update Task - {task_id}",
            "PATCH",
            f"tasks/{task_id}",
            200,
            data=update_data
        )
        return success, response

    def test_delete_task(self, task_id):
        """Test task deletion"""
        success, response = self.run_test(
            f"Delete Task - {task_id}",
            "DELETE",
            f"tasks/{task_id}",
            200
        )
        return success, response

    def test_duplicate_user_email(self, email):
        """Test creating user with duplicate email"""
        success, response = self.run_test(
            f"Create Duplicate User - {email}",
            "POST",
            "users",
            400,
            data={"name": "Duplicate User", "email": email}
        )
        return success

    def test_nonexistent_task(self):
        """Test getting non-existent task"""
        fake_id = "non-existent-id"
        success, response = self.run_test(
            "Get Non-existent Task",
            "GET",
            f"tasks/{fake_id}",
            404
        )
        return success

def main():
    print("🚀 Starting Task Tracker API Tests")
    print("=" * 50)
    
    tester = TaskTrackerAPITester()
    
    # Test 1: Root endpoint
    tester.test_root_endpoint()
    
    # Test 2: Create users
    user1_id = tester.test_create_user("John Doe", "john@example.com")
    user2_id = tester.test_create_user("Jane Smith", "jane@example.com")
    
    if not user1_id or not user2_id:
        print("❌ User creation failed, stopping tests")
        return 1
    
    # Test 3: Get all users
    tester.test_get_users()
    
    # Test 4: Test duplicate email
    tester.test_duplicate_user_email("john@example.com")
    
    # Test 5: Create tasks
    task1_id = tester.test_create_task(
        "Complete project documentation", 
        "Write comprehensive documentation for the project",
        assignee_id=user1_id,
        status="todo",
        due_date="2024-12-31"
    )
    
    task2_id = tester.test_create_task(
        "Review code changes",
        "Review and approve pending code changes",
        assignee_id=user2_id,
        status="in-progress"
    )
    
    task3_id = tester.test_create_task(
        "Deploy to production",
        "Deploy the latest version to production environment",
        status="done"
    )
    
    if not task1_id or not task2_id or not task3_id:
        print("❌ Task creation failed, stopping tests")
        return 1
    
    # Test 6: Get all tasks
    tester.test_get_tasks()
    
    # Test 7: Get tasks with filters
    tester.test_get_tasks(status="todo")
    tester.test_get_tasks(status="in-progress")
    tester.test_get_tasks(status="done")
    tester.test_get_tasks(assignee_id=user1_id)
    tester.test_get_tasks(assignee_id=user2_id)
    
    # Test 8: Get specific task
    tester.test_get_task_by_id(task1_id)
    
    # Test 9: Update task
    tester.test_update_task(task1_id, {
        "status": "in-progress",
        "title": "Complete project documentation - Updated"
    })
    
    # Test 10: Update task assignee
    tester.test_update_task(task3_id, {
        "assignee_id": user1_id
    })
    
    # Test 11: Test error cases
    tester.test_nonexistent_task()
    
    # Test 12: Delete task
    tester.test_delete_task(task2_id)
    
    # Test 13: Verify task was deleted (should return 404)
    success, response = tester.run_test(
        f"Verify Deleted Task - {task2_id}",
        "GET",
        f"tasks/{task2_id}",
        404
    )
    
    # Print final results
    print("\n" + "=" * 50)
    print(f"📊 Final Results: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print(f"⚠️  {tester.tests_run - tester.tests_passed} tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())