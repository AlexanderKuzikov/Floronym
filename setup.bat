@echo off
chcp 65001 >nul
echo [Floronym] Creating project structure...

if not exist src\core mkdir src\core
if not exist src\providers mkdir src\providers
if not exist src\generation mkdir src\generation
if not exist src\validation mkdir src\validation
if not exist src\store mkdir src\store
if not exist config mkdir config
if not exist data mkdir data

if not exist src\core\TokenBudget.ts type nul > src\core\TokenBudget.ts
if not exist src\core\RateLimiter.ts type nul > src\core\RateLimiter.ts
if not exist src\core\Logger.ts type nul > src\core\Logger.ts
if not exist src\providers\BaseProvider.ts type nul > src\providers\BaseProvider.ts
if not exist src\providers\GroqProvider.ts type nul > src\providers\GroqProvider.ts
if not exist src\providers\LmStudioProvider.ts type nul > src\providers\LmStudioProvider.ts
if not exist src\providers\ProviderManager.ts type nul > src\providers\ProviderManager.ts
if not exist src\generation\ThemeQueue.ts type nul > src\generation\ThemeQueue.ts
if not exist src\generation\PromptBuilder.ts type nul > src\generation\PromptBuilder.ts
if not exist src\generation\Generator.ts type nul > src\generation\Generator.ts
if not exist src\validation\Validator.ts type nul > src\validation\Validator.ts
if not exist src\store\NameStore.ts type nul > src\store\NameStore.ts
if not exist src\index.ts type nul > src\index.ts
if not exist config\models.ts type nul > config\models.ts
if not exist config\themes.ts type nul > config\themes.ts
if not exist data\.gitkeep type nul > data\.gitkeep

if not exist .env.example (
    echo # Groq API> .env.example
    echo GROQ_API_KEY=gsk_your_key_here>> .env.example
    echo.>> .env.example
    echo # LM Studio ^(optional^)>> .env.example
    echo LM_STUDIO_BASE_URL=http://localhost:1234/v1>> .env.example
    echo.>> .env.example
    echo # Generator>> .env.example
    echo LOG_LEVEL=info>> .env.example
    echo AUTOSAVE_EVERY=100>> .env.example
    echo NAMES_FILE=data/names.json>> .env.example
)

if not exist .env copy .env.example .env >nul

echo [Floronym] Done!
echo.
echo Next: add GROQ_API_KEY to .env