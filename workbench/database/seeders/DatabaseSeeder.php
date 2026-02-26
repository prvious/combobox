<?php

namespace Workbench\Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Workbench\App\Models\Category;
use Workbench\App\Models\Tag;
use Workbench\App\Models\User;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin',
                'password' => bcrypt('password'),
            ]
        );

        $categories = [
            'Technology', 'Science', 'Health', 'Business', 'Entertainment',
            'Sports', 'Politics', 'Education', 'Travel', 'Food',
            'Fashion', 'Art', 'Music', 'Gaming', 'Finance',
            'Environment', 'Lifestyle', 'History', 'Photography', 'Design',
        ];

        foreach ($categories as $name) {
            Category::updateOrCreate(
                ['slug' => Str::slug($name)],
                ['name' => $name]
            );
        }

        $tags = [
            'Laravel', 'PHP', 'JavaScript', 'TypeScript', 'Vue.js',
            'React', 'Alpine.js', 'Tailwind CSS', 'Livewire', 'Filament',
            'Docker', 'AWS', 'PostgreSQL', 'MySQL', 'Redis',
            'GraphQL', 'REST API', 'WebSockets', 'Testing', 'CI/CD',
            'Kubernetes', 'Serverless', 'Machine Learning', 'AI', 'Blockchain',
            'Mobile', 'Security', 'DevOps', 'Open Source', 'Tutorial',
        ];

        foreach ($tags as $name) {
            Tag::updateOrCreate(
                ['slug' => Str::slug($name)],
                ['name' => $name]
            );
        }
    }
}
