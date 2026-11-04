<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

function sanitizeTagList($raw) {
    if (empty($raw)) return [];
    $cleanItems = [];
    $walk = function($val) use (&$walk, &$cleanItems) {
        if (is_array($val)) {
            foreach ($val as $sub) $walk($sub);
        } elseif (is_string($val)) {
            $s = trim($val);
            if ((str_starts_with($s, '[') && str_ends_with($s, ']')) || (str_starts_with($s, '{') && str_ends_with($s, '}'))) {
                $dec = json_decode($s, true);
                if (json_last_error() === JSON_ERROR_NONE && is_array($dec)) {
                    foreach ($dec as $sub) $walk($sub);
                    return;
                }
            }
            $s = stripslashes($s);
            $s = preg_replace('/^[\["\'\\\\]+|[\]"\'\\\\]+$/u', '', $s);
            $s = trim($s);
            if (!empty($s)) {
                $cleanItems[] = $s;
            }
        }
    };
    $walk($raw);
    return array_values(array_unique($cleanItems));
}

foreach (App\Models\Service::all() as $s) {
    $cleaned = sanitizeTagList($s->tags);
    $s->tags = $cleaned;
    $s->save();
    echo $s->slug . ' => ' . json_encode($cleaned, JSON_UNESCAPED_UNICODE) . PHP_EOL;
}
echo "ALL TAGS CLEANED SUCCESSFULLY!\n";
