#!/bin/bash

# Program and lesson definitions from dashboard (lines 18-139)
declare -A PROGRAMS

# ai-seeds
PROGRAMS[ai-seeds]="what-is-ai how-machines-learn your-first-ai-model"
PROGRAMS[ai-sprouts]="algorithms-explained datasets-and-data neural-networks-intro"
PROGRAMS[ai-branches]="ai-in-healthcare chatbots-and-nlp computer-vision-basics"
PROGRAMS[ai-canopy]="deep-neural-networks large-language-models prompt-engineering-mastery"
PROGRAMS[ai-forest]="building-ai-products future-of-ai open-source-ai"
PROGRAMS[ai-sketch]="arrays-and-hashing strings-and-patterns sorting-and-searching"
PROGRAMS[ai-chisel]="two-pointers-and-sliding-window trees-and-graph-traversal stacks-queues-monotonic"
PROGRAMS[ai-craft]="design-url-shortener design-rate-limiter design-recommendation-engine"
PROGRAMS[ai-polish]="star-framework communicating-technical-ideas ai-era-leadership"
PROGRAMS[ai-masterpiece]="design-twitter-ai-feed engineering-portfolio full-mock-interview"

echo "===== LESSON FILE VERIFICATION ====="
echo ""

for program_slug in "${!PROGRAMS[@]}"; do
    echo "📚 Program: $program_slug"
    
    for lesson_slug in ${PROGRAMS[$program_slug]}; do
        lesson_path="content/programs/$program_slug/lessons/en/${lesson_slug}.mdx"
        
        if [ -f "$lesson_path" ]; then
            echo "  ✅ $lesson_slug"
        else
            echo "  ❌ $lesson_slug"
        fi
    done
    echo ""
done
