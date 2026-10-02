<?php

namespace App\Http\Requests;

use App\Http\Requests\Concerns\ValidatesProjectData;
use Illuminate\Foundation\Http\FormRequest;

class UpdateProjectRequest extends FormRequest
{
    use ValidatesProjectData;
}
