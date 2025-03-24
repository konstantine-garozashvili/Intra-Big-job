<?php

namespace App\Enum;

enum DocumentAction: string
{
    case CREATED = 'created';
    case UPDATED = 'updated';
    case DOWNLOADED = 'downloaded';
    case DELETED = 'deleted';
    case VALIDATED = 'validated';
    case REJECTED = 'rejected';
} 