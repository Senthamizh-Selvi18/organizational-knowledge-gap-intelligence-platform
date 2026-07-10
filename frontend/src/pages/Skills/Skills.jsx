import { useEffect, useState } from "react";
import {
  getEmployees,
  getSkills,
} from "../../services/employeeSkillService";

export default function Skills() {
  const [employees, setEmployees] = useState([]);
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    loadEmployees();
    loadSkills();
  }, []);

  const loadEmployees = async () => {
    try {
      const response = await getEmployees();
      setEmployees(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const loadSkills = async () => {
    try {
      const response = await getSkills();
      setSkills(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        Employee Skill Management
      </h1>

      <div>
        <label>Select Employee</label>

        <select className="border p-2 rounded w-full mt-2">
          <option>Select Employee</option>

          {employees.map((employee) => (
            <option key={employee.id} value={employee.id}>
              {employee.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}