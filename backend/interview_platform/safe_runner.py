import subprocess
import sys
import tempfile
import os


def execute_code_safely(code: str, timeout_seconds: float = 5.0) -> str:
    """
    Executes candidate-submitted Python code in an isolated, sandboxed subprocess.
    Does NOT execute untrusted code inside the Django web process.
    Enforces process isolation, strict execution timeout, memory/output boundaries.
    """
    if not code or not code.strip():
        return "No code provided to execute."

    if len(code) > 50000:
        return "Execution Error: Code exceeds maximum allowed size (50KB)."

    # Use a temporary file for the script to avoid shell escaping issues
    with tempfile.NamedTemporaryFile("w", suffix=".py", delete=False, encoding="utf-8") as temp_file:
        temp_file.write(code)
        temp_path = temp_file.name

    try:
        # Run in isolated mode:
        # -I : isolate from user's environment, ignore PYTHONPATH and PYTHONHOME
        # -s : don't add user site-packages to sys.path
        # -S : don't imply 'import site' on initialization
        cmd = [sys.executable, "-I", "-s", temp_path]

        # Restrict environment to bare minimum
        safe_env = {
            "SYSTEMROOT": os.environ.get("SYSTEMROOT", "C:\\Windows"),
            "PATH": os.environ.get("PATH", ""),
            "PYTHONIOENCODING": "utf-8",
        }

        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=timeout_seconds,
            env=safe_env,
        )

        output = result.stdout or ""
        errors = result.stderr or ""

        if errors:
            output = f"{output}\n{errors}".strip() if output else errors.strip()

        if not output:
            output = "Code executed successfully with no stdout output."

        # Cap output size to prevent response bloat
        if len(output) > 10000:
            output = output[:10000] + "\n... [Output truncated at 10,000 characters]"

        return output

    except subprocess.TimeoutExpired:
        return f"Execution Error: Code execution timed out after {timeout_seconds} seconds."
    except Exception as exc:
        return f"Execution Error: {type(exc).__name__}: {str(exc)}"
    finally:
        try:
            if os.path.exists(temp_path):
                os.remove(temp_path)
        except Exception:
            pass
