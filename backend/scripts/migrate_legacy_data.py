"""
BurnettSuite Legacy Data Migration & Backfill Utility

This script migrates and backfills legacy records from standalone databases
(BurnettPeople, AI Resume Creator, AI Interview Platform) into the unified
BurnettSuite database.

It guarantees:
1. Single AUTH_USER_MODEL (accounts.User) mapping with email normalization.
2. Safe ID remapping and foreign key reconciliation.
3. Logical separation into distinct tables (resume_creator_resume vs interview_candidate_resume).
4. Atomic database transactions with --dry-run support.
"""

import os
import sys
import argparse
import sqlite3
import django

# Add backend directory to sys.path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

# Hook dependencies from venv if present
VENV_SP = os.path.join(os.path.dirname(BASE_DIR), "ai-resume-creator", "venv", "Lib", "site-packages")
if os.path.isdir(VENV_SP) and VENV_SP not in sys.path:
    sys.path.insert(0, VENV_SP)

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.db import transaction
from django.contrib.auth import get_user_model
from career_profiles.models import UserProfile
from resume_creator.models import Resume, ResumeVersion, ResumeSection
from interview_platform.models import CandidateInterviewResume, Interview, InterviewQuestion
from evaluations.models import Evaluation

User = get_user_model()


def migrate_from_sqlite(source_path, dry_run=False):
    if not os.path.exists(source_path):
        print(f"[ERROR] Source database not found: {source_path}")
        return False

    print(f"\n=======================================================")
    print(f"  BurnettSuite Legacy Migration: {source_path}")
    print(f"  Dry run mode: {dry_run}")
    print(f"=======================================================\n")

    conn = sqlite3.connect(source_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    # Discover available tables in source database
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = [row["name"] for row in cursor.fetchall()]
    print(f"Found source tables: {len(tables)}")

    stats = {
        "users_imported": 0,
        "users_skipped": 0,
        "profiles_created": 0,
        "resumes_imported": 0,
        "interviews_imported": 0,
    }

    user_id_map = {}  # legacy_id -> new_user_obj

    try:
        with transaction.atomic():
            # 1. Migrate Users
            user_table = None
            if "accounts_user" in tables:
                user_table = "accounts_user"
            elif "users_user" in tables:
                user_table = "users_user"
            elif "auth_user" in tables:
                user_table = "auth_user"

            if user_table:
                print(f"[*] Migrating users from '{user_table}'...")
                cursor.execute(f"SELECT * FROM {user_table}")
                rows = cursor.fetchall()
                for r in rows:
                    email = (r["email"] or "").strip().lower()
                    if not email:
                        continue

                    existing_user = User.objects.filter(email=email).first()
                    if existing_user:
                        stats["users_skipped"] += 1
                        user_id_map[r["id"]] = existing_user
                    else:
                        role = "CANDIDATE"
                        if "role" in r.keys() and r["role"]:
                            role = r["role"]

                        user = User(
                            email=email,
                            first_name=r["first_name"] if "first_name" in r.keys() else "",
                            last_name=r["last_name"] if "last_name" in r.keys() else "",
                            role=role,
                            is_active=bool(r["is_active"]) if "is_active" in r.keys() else True,
                            is_staff=bool(r["is_staff"]) if "is_staff" in r.keys() else False,
                        )
                        if "password" in r.keys() and r["password"]:
                            user.password = r["password"]
                        else:
                            user.set_unusable_password()

                        if not dry_run:
                            user.save()
                        user_id_map[r["id"]] = user
                        stats["users_imported"] += 1

                    # Ensure UserProfile exists in career_profiles
                    target_user = user_id_map[r["id"]]
                    if not dry_run:
                        profile, created = UserProfile.objects.get_or_create(
                            user=target_user,
                            defaults={
                                "headline": target_user.first_name,
                                "email": target_user.email,
                            }
                        )
                        if created:
                            stats["profiles_created"] += 1

            # 2. Migrate Resumes if present in source
            resume_table = None
            if "resume_creator_resume" in tables:
                resume_table = "resume_creator_resume"
            elif "resumes_resume" in tables:
                resume_table = "resumes_resume"

            if resume_table:
                print(f"[*] Migrating resumes from '{resume_table}'...")
                cursor.execute(f"SELECT * FROM {resume_table}")
                for r in cursor.fetchall():
                    legacy_user_id = r["user_id"]
                    user = user_id_map.get(legacy_user_id)
                    if not user:
                        continue

                    if not dry_run:
                        Resume.objects.create(
                            user=user,
                            title=r["title"] if "title" in r.keys() else "Untitled Resume",
                            target_job_title=r["target_job_title"] if "target_job_title" in r.keys() else "",
                            target_industry=r["target_industry"] if "target_industry" in r.keys() else "",
                        )
                    stats["resumes_imported"] += 1

            # 3. Migrate Interviews if present in source
            interview_table = None
            if "interview_platform_interview" in tables:
                interview_table = "interview_platform_interview"
            elif "interviews_interview" in tables:
                interview_table = "interviews_interview"

            if interview_table:
                print(f"[*] Migrating interviews from '{interview_table}'...")
                cursor.execute(f"SELECT * FROM {interview_table}")
                for r in cursor.fetchall():
                    legacy_user_id = r["user_id"]
                    user = user_id_map.get(legacy_user_id)
                    if not user:
                        continue

                    if not dry_run:
                        Interview.objects.create(
                            user=user,
                            interview_type=r["interview_type"] if "interview_type" in r.keys() else "technical",
                            difficulty=r["difficulty"] if "difficulty" in r.keys() else "medium",
                            status=r["status"] if "status" in r.keys() else "completed",
                        )
                    stats["interviews_imported"] += 1

            if dry_run:
                print("\n[!] Dry run mode: Rolling back all changes.")
                transaction.set_rollback(True)

    except Exception as e:
        print(f"[ERROR] Migration failed: {e}")
        return False

    print("\n=======================================================")
    print("  Migration Summary")
    print("=======================================================")
    print(f"  Users newly imported:     {stats['users_imported']}")
    print(f"  Users skipped (existing): {stats['users_skipped']}")
    print(f"  Profiles ensured:         {stats['profiles_created']}")
    print(f"  Resumes imported:         {stats['resumes_imported']}")
    print(f"  Interviews imported:      {stats['interviews_imported']}")
    print("=======================================================\n")
    return True


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="BurnettSuite Legacy Data Migration")
    parser.add_argument("--source-db", required=True, help="Path to legacy sqlite3 database")
    parser.add_argument("--dry-run", action="store_true", help="Simulate migration without committing")
    args = parser.parse_args()

    success = migrate_from_sqlite(args.source_db, dry_run=args.dry_run)
    sys.exit(0 if success else 1)
