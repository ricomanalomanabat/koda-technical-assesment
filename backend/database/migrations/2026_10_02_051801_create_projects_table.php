<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->string('client_name');
            $table->string('project_name');
            $table->text('description')->default('');
            $table->string('status', 20);
            $table->string('priority', 10);
            $table->date('start_date');
            $table->date('due_date');
            $table->timestamps();
        });

        // Schema builder has no cross-driver helper for CHECK constraints,
        // so enforce the enums and date rule directly in Postgres.
        DB::statement("ALTER TABLE projects ADD CONSTRAINT projects_status_check CHECK (status IN ('Planning', 'In Progress', 'On Hold', 'Completed'))");
        DB::statement("ALTER TABLE projects ADD CONSTRAINT projects_priority_check CHECK (priority IN ('Low', 'Medium', 'High'))");
        DB::statement('ALTER TABLE projects ADD CONSTRAINT projects_due_date_check CHECK (due_date >= start_date)');
    }

    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
