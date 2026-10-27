try:
    from celery import shared_task
except ImportError:
    def shared_task(*dargs, **dkwargs):
        def decorator(fn):
            fn.delay = fn
            fn.apply_async = lambda args=(), kwargs={}: fn(*args, **kwargs)
            return fn
        return decorator


@shared_task(name="core.worker_smoke_test")
def worker_smoke_test(message="BurnettPeople worker is connected"):
    return {
        "status": "ok",
        "message": message,
    }
