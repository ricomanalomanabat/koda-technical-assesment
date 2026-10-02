<?php

namespace App\Http\Requests\Concerns;

use Illuminate\Validation\Rule;

// Create and update both submit the full project, so they share the
// same validation rules.
trait ValidatesProjectData
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'clientName' => ['required', 'string'],
            'projectName' => ['required', 'string'],
            'description' => ['nullable', 'string'],
            'status' => ['required', Rule::in(['Planning', 'In Progress', 'On Hold', 'Completed'])],
            'priority' => ['required', Rule::in(['Low', 'Medium', 'High'])],
            'startDate' => ['required', 'date'],
            'dueDate' => ['required', 'date', 'after_or_equal:startDate'],
        ];
    }

    public function messages(): array
    {
        return [
            'clientName.required' => 'Client Name is required.',
            'projectName.required' => 'Project Name is required.',
            'status.required' => 'Status is required.',
            'status.in' => 'Status must be one of: Planning, In Progress, On Hold, Completed.',
            'priority.required' => 'Priority is required.',
            'priority.in' => 'Priority must be one of: Low, Medium, High.',
            'startDate.required' => 'Start Date is required.',
            'startDate.date' => 'Start Date must be a valid date.',
            'dueDate.required' => 'Due Date is required.',
            'dueDate.date' => 'Due Date must be a valid date.',
            'dueDate.after_or_equal' => 'Due Date cannot be earlier than Start Date.',
        ];
    }

    // Maps the API's camelCase payload to the model's snake_case columns.
    public function toModelAttributes(): array
    {
        $data = $this->validated();

        return [
            'client_name' => $data['clientName'],
            'project_name' => $data['projectName'],
            'description' => $data['description'] ?? '',
            'status' => $data['status'],
            'priority' => $data['priority'],
            'start_date' => $data['startDate'],
            'due_date' => $data['dueDate'],
        ];
    }
}
