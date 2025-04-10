<?php
/**
 * JWT Routes Fix Tool
 * 
 * This script checks and fixes JWT route configuration issues
 */

// Basic HTML styling
echo <<<HTML
<!DOCTYPE html>
<html>
<head>
    <title>JWT Routes Fix Tool</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; line-height: 1.6; }
        .container { max-width: 1000px; margin: 0 auto; }
        .card { border: 1px solid #ddd; border-radius: 4px; padding: 15px; margin-bottom: 20px; }
        h1, h2 { color: #333; }
        pre { background: #f5f5f5; padding: 10px; border-radius: 4px; overflow-x: auto; }
        .success { color: green; }
        .error { color: red; }
        .warning { color: orange; }
        button { padding: 10px 15px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; }
        button:hover { background: #45a049; }
    </style>
</head>
<body>
    <div class="container">
        <h1>JWT Routes Fix Tool</h1>
HTML;

// Determine project structure
$currentDir = getcwd();
$backendDir = file_exists($currentDir . '/backend') 
    ? $currentDir . '/backend' 
    : $currentDir;

echo '<div class="card">';
echo '<h2>Environment Information</h2>';
echo '<p><strong>PHP Version:</strong> ' . phpversion() . '</p>';
echo '<p><strong>Server:</strong> ' . ($_SERVER['SERVER_SOFTWARE'] ?? 'Unknown') . '</p>';
echo '<p><strong>Current Directory:</strong> ' . $currentDir . '</p>';
echo '<p><strong>Backend Directory:</strong> ' . $backendDir . '</p>';
echo '</div>';

// Configuration files
$routesYaml = $backendDir . '/config/routes.yaml';
$securityYaml = $backendDir . '/config/packages/security.yaml';
$jwtYaml = $backendDir . '/config/packages/lexik_jwt_authentication.yaml';

// Check configuration files
echo '<div class="card">';
echo '<h2>Current Configuration</h2>';

$files = [
    'routes.yaml' => $routesYaml,
    'security.yaml' => $securityYaml,
    'lexik_jwt_authentication.yaml' => $jwtYaml
];

foreach ($files as $name => $path) {
    echo "<h3>$name</h3>";
    
    if (file_exists($path)) {
        echo '<p class="success">✓ File exists</p>';
        $content = file_get_contents($path);
        echo '<pre>' . htmlspecialchars($content) . '</pre>';
    } else {
        echo '<p class="error">✗ File does not exist</p>';
    }
}

echo '</div>';

// Fix routes
if (isset($_POST['fix_routes'])) {
    echo '<div class="card">';
    echo '<h2>Applying Fixes</h2>';
    
    // Step 1: Check and fix routes.yaml
    echo '<h3>Step 1: Checking routes.yaml</h3>';
    
    if (file_exists($routesYaml)) {
        $routesContent = file_get_contents($routesYaml);
        $needsUpdate = false;
        
        // Check if login_check route exists
        if (strpos($routesContent, 'api_login_check') === false) {
            echo '<p class="warning">⚠ api_login_check route not found in routes.yaml</p>';
            $needsUpdate = true;
        } else {
            echo '<p class="success">✓ api_login_check route found</p>';
        }
        
        if ($needsUpdate) {
            // Add the JWT routes
            $jwtRoutes = <<<YAML

# JWT Authentication routes
api_login_check:
    path: /api/login_check
    methods: ['POST']

YAML;
            
            // Add to the beginning of the file to ensure they take precedence
            $routesContent = $jwtRoutes . $routesContent;
            
            if (file_put_contents($routesYaml, $routesContent)) {
                echo '<p class="success">✓ Updated routes.yaml with JWT routes</p>';
                echo '<pre>' . htmlspecialchars($routesContent) . '</pre>';
            } else {
                echo '<p class="error">✗ Failed to update routes.yaml</p>';
            }
        }
    } else {
        echo '<p class="error">✗ routes.yaml does not exist, creating it</p>';
        
        // Create minimal routes.yaml
        $routesContent = <<<YAML
# JWT Authentication routes
api_login_check:
    path: /api/login_check
    methods: ['POST']

# Default routes
controllers:
    resource:
        path: ../src/Controller/
        namespace: App\Controller
    type: attribute

YAML;
        
        if (file_put_contents($routesYaml, $routesContent)) {
            echo '<p class="success">✓ Created routes.yaml with JWT routes</p>';
            echo '<pre>' . htmlspecialchars($routesContent) . '</pre>';
        } else {
            echo '<p class="error">✗ Failed to create routes.yaml</p>';
        }
    }
    
    // Step 2: Check and fix security.yaml
    echo '<h3>Step 2: Checking security.yaml</h3>';
    
    if (file_exists($securityYaml)) {
        $securityContent = file_get_contents($securityYaml);
        $needsUpdate = false;
        
        // Check if login path is configured correctly
        if (strpos($securityContent, 'check_path: /api/login_check') === false) {
            echo '<p class="warning">⚠ JWT login check_path not found or incorrect in security.yaml</p>';
            $needsUpdate = true;
        } else {
            echo '<p class="success">✓ JWT login check_path is configured correctly</p>';
        }
        
        if ($needsUpdate) {
            // This is a bit tricky as YAML files should be parsed properly for modification
            // We'll use a simple search and replace approach here
            if (preg_match('/check_path:\s+[^\n]+/', $securityContent)) {
                $securityContent = preg_replace('/check_path:\s+[^\n]+/', 'check_path: /api/login_check', $securityContent);
                echo '<p class="success">✓ Fixed check_path in security.yaml</p>';
            } else {
                echo '<p class="warning">⚠ Could not find check_path pattern in security.yaml. Manual inspection needed.</p>';
            }
            
            if (file_put_contents($securityYaml, $securityContent)) {
                echo '<p class="success">✓ Updated security.yaml</p>';
                echo '<pre>' . htmlspecialchars($securityContent) . '</pre>';
            } else {
                echo '<p class="error">✗ Failed to update security.yaml</p>';
            }
        }
    }
    
    // Step 3: Check services.yaml for JWT configuration
    echo '<h3>Step 3: Checking services.yaml for JWT Configuration</h3>';
    
    $servicesYaml = $backendDir . '/config/services.yaml';
    if (file_exists($servicesYaml)) {
        $servicesContent = file_get_contents($servicesYaml);
        
        if (strpos($servicesContent, 'lexik_jwt_authentication') === false) {
            echo '<p class="warning">⚠ JWT service configuration not found in services.yaml</p>';
            
            // Add JWT service configuration
            $jwtService = <<<YAML

    # JWT Authentication
    acme_api.event.authentication_success_listener:
        class: App\EventListener\AuthenticationSuccessListener
        tags:
            - { name: kernel.event_listener, event: lexik_jwt_authentication.on_authentication_success, method: onAuthenticationSuccessResponse }

YAML;
            
            // Add before the last service section if possible
            if (preg_match('/services:/', $servicesContent)) {
                // Add after services section
                $servicesContent = preg_replace('/(services:.*?)(\n\n|\Z)/s', '$1' . $jwtService . '$2', $servicesContent);
                
                if (file_put_contents($servicesYaml, $servicesContent)) {
                    echo '<p class="success">✓ Updated services.yaml with JWT service configuration</p>';
                    echo '<pre>' . htmlspecialchars($servicesContent) . '</pre>';
                } else {
                    echo '<p class="error">✗ Failed to update services.yaml</p>';
                }
            } else {
                echo '<p class="warning">⚠ Could not find appropriate place to add JWT service in services.yaml</p>';
            }
        } else {
            echo '<p class="success">✓ JWT service configuration found in services.yaml</p>';
        }
    }
    
    // Step 4: Create a test controller for diagnosis
    echo '<h3>Step 4: Creating Diagnostic Controller</h3>';
    
    $testControllerPath = $backendDir . '/src/Controller/DiagnosticController.php';
    $testControllerContent = <<<'PHP'
<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

class DiagnosticController extends AbstractController
{
    /**
     * @Route("/api/diagnostic", name="api_diagnostic")
     */
    public function index(): JsonResponse
    {
        return new JsonResponse([
            'status' => 'ok',
            'message' => 'API is working',
            'timestamp' => new \DateTime(),
            'routes' => array_keys($this->container->get('router')->getRouteCollection()->all())
        ]);
    }
    
    /**
     * @Route("/api/diagnostic/env", name="api_diagnostic_env")
     */
    public function env(): JsonResponse
    {
        return new JsonResponse([
            'php_version' => PHP_VERSION,
            'symfony_env' => $_SERVER['APP_ENV'] ?? getenv('APP_ENV') ?? 'unknown',
            'debug' => $_SERVER['APP_DEBUG'] ?? getenv('APP_DEBUG') ?? 'unknown',
            'jwt_ttl' => getenv('JWT_TTL') ?? 'default',
            'project_dir' => $this->getParameter('kernel.project_dir'),
            'cache_dir' => $this->getParameter('kernel.cache_dir'),
            'environment' => $this->getParameter('kernel.environment')
        ]);
    }
}
PHP;

    if (!file_exists($testControllerPath)) {
        if (file_put_contents($testControllerPath, $testControllerContent)) {
            echo '<p class="success">✓ Created diagnostic controller</p>';
        } else {
            echo '<p class="error">✗ Failed to create diagnostic controller</p>';
        }
    } else {
        echo '<p class="success">✓ Diagnostic controller already exists</p>';
    }
    
    // Step 5: Clear cache for changes to take effect
    echo '<h3>Step 5: Clearing Cache</h3>';
    
    $cacheDir = $backendDir . '/var/cache';
    if (file_exists($cacheDir)) {
        $cacheItems = glob($cacheDir . '/*');
        foreach ($cacheItems as $item) {
            if (is_dir($item)) {
                @system('rm -rf ' . escapeshellarg($item));
            } else {
                @unlink($item);
            }
        }
        echo '<p class="success">✓ Cleared cache directory</p>';
    }
    
    // Set proper path for PHP command
    $phpPath = '/usr/bin/php';
    if (!file_exists($phpPath)) {
        // Try common locations
        foreach (['/bin/php', '/usr/local/bin/php', '/opt/php/bin/php'] as $path) {
            if (file_exists($path)) {
                $phpPath = $path;
                break;
            }
        }
    }
    
    echo '<p>Using PHP path: ' . $phpPath . '</p>';
    
    // Try to warm up cache using console with full path to PHP
    $consolePath = $backendDir . '/bin/console';
    if (file_exists($consolePath)) {
        echo '<p>Attempting to warm up cache with console command...</p>';
        $output = [];
        $command = 'cd ' . escapeshellarg($backendDir) . ' && ' . $phpPath . ' bin/console cache:clear --env=prod 2>&1';
        exec($command, $output, $returnCode);
        
        if ($returnCode === 0) {
            echo '<p class="success">✓ Successfully cleared cache</p>';
        } else {
            echo '<p class="warning">⚠ Cache clear command returned code ' . $returnCode . '</p>';
            echo '<pre>' . htmlspecialchars(implode("\n", $output)) . '</pre>';
            
            // Try alternative approach - just create a cache directory with proper permissions
            if (!file_exists($cacheDir . '/prod')) {
                if (mkdir($cacheDir . '/prod', 0777, true)) {
                    echo '<p class="success">✓ Created prod cache directory with permissions 777</p>';
                }
            } else {
                @chmod($cacheDir . '/prod', 0777);
                echo '<p class="success">✓ Set prod cache directory permissions to 777</p>';
            }
        }
    }
    
    echo '<h3>Complete!</h3>';
    echo '<p>All fixes have been applied. Try accessing the API endpoints now.</p>';
    echo '<p>You can test the API diagnostic endpoint at: <a href="/api/diagnostic" target="_blank">/api/diagnostic</a></p>';
    echo '</div>';
}

// Form for applying fixes
echo '<div class="card">';
echo '<h2>Fix JWT Routes</h2>';
echo '<p>This tool will:</p>';
echo '<ol>';
echo '<li>Fix routes.yaml to properly define the /api/login_check route</li>';
echo '<li>Ensure security.yaml has the correct check_path</li>';
echo '<li>Check services.yaml for JWT configuration</li>';
echo '<li>Create a diagnostic controller to help troubleshooting</li>';
echo '<li>Clear the cache</li>';
echo '</ol>';

echo '<form method="post">';
echo '<button type="submit" name="fix_routes">Apply JWT Route Fixes</button>';
echo '</form>';
echo '</div>';

// Test API endpoints
echo '<div class="card">';
echo '<h2>Test API Endpoints</h2>';
echo '<p>After applying fixes, test these endpoints:</p>';
echo '<ul>';
echo '<li><a href="/api/login_check" target="_blank">/api/login_check</a> (POST required)</li>';
echo '<li><a href="/api/diagnostic" target="_blank">/api/diagnostic</a> (created by this tool)</li>';
echo '<li><a href="/api/diagnostic/env" target="_blank">/api/diagnostic/env</a> (shows environment info)</li>';
echo '</ul>';
echo '</div>';

echo <<<HTML
    </div>
</body>
</html>
HTML; 