<?php

namespace Database\Seeders;

use App\Models\Project;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProjectSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $projects = json_decode(file_get_contents(base_path('test_data.json')), true);

        foreach ($projects as $project) {
            // withTrashed() so re-seeding a soft-deleted id updates that row
            // instead of colliding with its still-present primary key.
            Project::withTrashed()->updateOrCreate(
                ['id' => $project['id']],
                [
                    'client_name' => $project['clientName'],
                    'project_name' => $project['projectName'],
                    'description' => $project['description'] ?? '',
                    'status' => $project['status'],
                    'priority' => $project['priority'],
                    'start_date' => $project['startDate'],
                    'due_date' => $project['dueDate'],
                ]
            );
        }

        // Explicit ids were inserted above, so nudge the auto-increment
        // sequence past them for the next INSERT without an id.
        DB::statement(
            "SELECT setval(pg_get_serial_sequence('projects', 'id'), COALESCE((SELECT MAX(id) FROM projects), 1))"
        );
    }
}
