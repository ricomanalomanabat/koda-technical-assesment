<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProjectApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Sanctum::actingAs(User::factory()->create());
    }

    private function validPayload(array $overrides = []): array
    {
        return array_merge([
            'clientName' => 'Acme Corporation',
            'projectName' => 'Website Redesign',
            'description' => 'Redesign the marketing site.',
            'status' => 'Planning',
            'priority' => 'Medium',
            'startDate' => '2026-06-01',
            'dueDate' => '2026-07-01',
        ], $overrides);
    }

    public function test_index_lists_projects(): void
    {
        Project::factory()->count(3)->create();

        $this->getJson('/api/projects')
            ->assertOk()
            ->assertJsonCount(3);
    }

    public function test_index_filters_by_status(): void
    {
        Project::factory()->create(['status' => 'Completed']);
        Project::factory()->create(['status' => 'Planning']);

        $this->getJson('/api/projects?status=Completed')
            ->assertOk()
            ->assertJsonCount(1);
    }

    public function test_show_returns_a_project(): void
    {
        $project = Project::factory()->create();

        $this->getJson("/api/projects/{$project->id}")
            ->assertOk()
            ->assertJson(['id' => $project->id, 'clientName' => $project->client_name]);
    }

    public function test_show_returns_404_for_unknown_id(): void
    {
        $this->getJson('/api/projects/999999')->assertNotFound();
    }

    public function test_store_creates_a_project(): void
    {
        $this->postJson('/api/projects', $this->validPayload())
            ->assertCreated()
            ->assertJson(['clientName' => 'Acme Corporation']);

        $this->assertDatabaseHas('projects', ['client_name' => 'Acme Corporation']);
    }

    public function test_store_requires_client_name(): void
    {
        $this->postJson('/api/projects', $this->validPayload(['clientName' => '']))
            ->assertStatus(422)
            ->assertJsonPath('errors.clientName', 'Client Name is required.');
    }

    public function test_store_rejects_invalid_status(): void
    {
        $this->postJson('/api/projects', $this->validPayload(['status' => 'Bogus']))
            ->assertStatus(422)
            ->assertJsonStructure(['errors' => ['status']]);
    }

    public function test_store_rejects_due_date_before_start_date(): void
    {
        $this->postJson('/api/projects', $this->validPayload([
            'startDate' => '2026-07-01',
            'dueDate' => '2026-06-01',
        ]))
            ->assertStatus(422)
            ->assertJsonPath('errors.dueDate', 'Due Date cannot be earlier than Start Date.');
    }

    public function test_update_modifies_a_project(): void
    {
        $project = Project::factory()->create();

        $this->putJson("/api/projects/{$project->id}", $this->validPayload(['status' => 'Completed']))
            ->assertOk()
            ->assertJson(['status' => 'Completed']);
    }

    public function test_update_returns_404_for_unknown_id(): void
    {
        $this->putJson('/api/projects/999999', $this->validPayload())->assertNotFound();
    }

    public function test_destroy_soft_deletes_a_project(): void
    {
        $project = Project::factory()->create();

        $this->deleteJson("/api/projects/{$project->id}")->assertNoContent();

        $this->assertSoftDeleted('projects', ['id' => $project->id]);
        $this->getJson("/api/projects/{$project->id}")->assertNotFound();
    }

    public function test_destroy_returns_404_for_unknown_id(): void
    {
        $this->deleteJson('/api/projects/999999')->assertNotFound();
    }

    public function test_index_excludes_trashed_projects_by_default(): void
    {
        Project::factory()->create();
        Project::factory()->create()->delete();

        $this->getJson('/api/projects')->assertOk()->assertJsonCount(1);
    }

    public function test_index_with_trashed_param_lists_only_deleted_projects(): void
    {
        Project::factory()->create();
        $deleted = Project::factory()->create();
        $deleted->delete();

        $this->getJson('/api/projects?trashed=1')
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.id', $deleted->id);
    }

    public function test_restore_brings_back_a_deleted_project(): void
    {
        $project = Project::factory()->create();
        $project->delete();

        $this->postJson("/api/projects/{$project->id}/restore")
            ->assertOk()
            ->assertJson(['id' => $project->id, 'deletedAt' => null]);

        $this->getJson("/api/projects/{$project->id}")->assertOk();
    }

    public function test_restore_returns_404_for_a_non_deleted_project(): void
    {
        $project = Project::factory()->create();

        $this->postJson("/api/projects/{$project->id}/restore")->assertNotFound();
    }
}
