#!/usr/bin/env python3
import argparse
import datetime
import os
import re
import shutil
import sys


ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DEFAULT_SOURCE = "_content"
DEFAULT_DEST = "_content_redirects"
MARKER_FILENAME = ".redirects-generated"
COLLECTIONS = ("blog", "projects")


def normalize_value(value: str) -> str:
    value = value.strip()
    if (value.startswith('"') and value.endswith('"')) or (
        value.startswith("'") and value.endswith("'")
    ):
        return value[1:-1]
    return value


def find_front_matter(lines):
    if not lines or lines[0].strip() != "---":
        return None
    for i in range(1, len(lines)):
        if lines[i].strip() == "---":
            return (0, i)
    return None


def get_slug(fm_lines, filename):
    for line in fm_lines:
        if line.lstrip() != line:
            continue
        m = re.match(r"^slug\s*:\s*(.*)$", line)
        if not m:
            continue
        value = m.group(1).split("#", 1)[0].strip()
        if value:
            return normalize_value(value)
    return os.path.splitext(os.path.basename(filename))[0]


def parse_redirect_block(fm_lines):
    idx = None
    for i, line in enumerate(fm_lines):
        if line.lstrip() != line:
            continue
        if re.match(r"^redirect_from\s*:", line):
            idx = i
            break
    if idx is None:
        return None

    line = fm_lines[idx]
    after = line.split(":", 1)[1]
    after_no_comment = after.split("#", 1)[0].strip()
    if after_no_comment:
        items = []
        value = after_no_comment.strip()
        if value.startswith("[") and value.endswith("]"):
            inner = value[1:-1].strip()
            if inner:
                parts = [p.strip() for p in inner.split(",") if p.strip()]
                items = [normalize_value(p) for p in parts]
        else:
            items = [normalize_value(value)]
        return {"index": idx, "style": "inline", "items": items, "range": (idx + 1, idx + 1)}

    list_start = idx + 1
    list_end = list_start
    items = []
    while list_end < len(fm_lines):
        line = fm_lines[list_end]
        if re.match(r"^\S", line):
            break
        m = re.match(r"^\s*-\s*(.+?)\s*(#.*)?$", line)
        if m:
            items.append(normalize_value(m.group(1)))
        list_end += 1
    return {"index": idx, "style": "block", "items": items, "range": (list_start, list_end)}


def ensure_redirect(fm_lines, collection, slug):
    short = f"/{collection}/{slug}/"

    redirect = parse_redirect_block(fm_lines)
    if redirect is None:
        if fm_lines and fm_lines[-1].strip() != "":
            fm_lines.append("\n")
        fm_lines.extend(["redirect_from:\n", f"  - {short}\n"])
        return True, fm_lines

    if short in redirect["items"]:
        return False, fm_lines

    if redirect["style"] == "inline":
        new_block = ["redirect_from:\n"]
        for item in redirect["items"] + [short]:
            new_block.append(f"  - {item}\n")
        idx = redirect["index"]
        fm_lines = fm_lines[:idx] + new_block + fm_lines[idx + 1 :]
    else:
        list_start, list_end = redirect["range"]
        indent = "  "
        for line in fm_lines[list_start:list_end]:
            m = re.match(r"^(\s*)-\s+", line)
            if m:
                indent = m.group(1)
                break
        fm_lines = (
            fm_lines[:list_end] + [f"{indent}- {short}\n"] + fm_lines[list_end:]
        )

    return True, fm_lines


def iter_content_files(root_dir):
    for base, _, files in os.walk(root_dir):
        for name in files:
            ext = os.path.splitext(name)[1].lower()
            if ext not in {".md", ".markdown"}:
                continue
            if name.startswith("."):
                continue
            yield os.path.join(base, name)


def collection_paths(content_dir):
    return {name: os.path.join(content_dir, f"_{name}") for name in COLLECTIONS}


def get_front_matter_value(fm_lines, key):
    pattern = re.compile(rf"^{re.escape(key)}\s*:\s*(.*)$")
    for line in fm_lines:
        if line.lstrip() != line:
            continue
        match = pattern.match(line)
        if not match:
            continue
        value = match.group(1).split("#", 1)[0].strip()
        return normalize_value(value)
    return None


def parse_date_value(raw_value):
    if not raw_value:
        return None
    match = re.match(r"^\s*(\d{4}-\d{2}-\d{2})", raw_value)
    if match:
        try:
            return datetime.date.fromisoformat(match.group(1))
        except ValueError:
            return None
    return None


def ensure_published_flag(fm_lines, value):
    for i, line in enumerate(fm_lines):
        if line.lstrip() != line:
            continue
        if re.match(r"^published\s*:", line):
            fm_lines[i] = f"published: {'true' if value else 'false'}\n"
            return True, fm_lines
    if value:
        return False, fm_lines
    insert_at = len(fm_lines)
    for i, line in enumerate(fm_lines):
        if line.lstrip() != line:
            continue
        if re.match(r"^(date_update|date_publish|date)\s*:", line):
            insert_at = i + 1
    fm_lines.insert(insert_at, "published: false\n")
    return True, fm_lines


def remove_redirect_block(fm_lines):
    redirect = parse_redirect_block(fm_lines)
    if redirect is None:
        return False, fm_lines
    idx = redirect["index"]
    if redirect["style"] == "inline":
        del fm_lines[idx]
        return True, fm_lines
    list_start, list_end = redirect["range"]
    del fm_lines[idx:list_end]
    return True, fm_lines


def process_collection(label, path, today):
    updated = 0
    for filepath in iter_content_files(path):
        with open(filepath, "r", encoding="utf-8", newline="") as handle:
            lines = handle.readlines()
        fm_bounds = find_front_matter(lines)
        if not fm_bounds:
            continue
        start, end = fm_bounds
        fm_lines = lines[start + 1 : end]
        slug = get_slug(fm_lines, filepath)
        publish_value = get_front_matter_value(fm_lines, "date_publish")
        if publish_value is None:
            publish_value = get_front_matter_value(fm_lines, "date")
        publish_date = parse_date_value(publish_value)
        is_future = publish_date is not None and publish_date > today

        changed = False
        if is_future:
            flag_changed, fm_lines = ensure_published_flag(fm_lines, False)
            changed = changed or flag_changed
            removed_redirects, fm_lines = remove_redirect_block(fm_lines)
            changed = changed or removed_redirects
        else:
            redirect_changed, fm_lines = ensure_redirect(fm_lines, label, slug)
            changed = changed or redirect_changed

        if changed:
            new_lines = lines[: start + 1] + fm_lines + lines[end:]
            with open(filepath, "w", encoding="utf-8", newline="") as handle:
                handle.writelines(new_lines)
            updated += 1
    return updated


def resolve_path(path):
    if os.path.isabs(path):
        return path
    return os.path.join(ROOT, path)


def ensure_empty_dest(dest_dir):
    if os.path.exists(dest_dir):
        marker = os.path.join(dest_dir, MARKER_FILENAME)
        if not os.path.isfile(marker):
            print(
                f"redirect: skipped because {dest_dir} exists without {MARKER_FILENAME}"
            )
            return False
        shutil.rmtree(dest_dir)
    os.makedirs(dest_dir, exist_ok=True)
    with open(os.path.join(dest_dir, MARKER_FILENAME), "w", encoding="utf-8") as handle:
        handle.write("generated\n")
    for name in COLLECTIONS:
        os.makedirs(os.path.join(dest_dir, f"_{name}"), exist_ok=True)
    return True


def prepare_destination(source_dir, dest_dir):
    if os.path.abspath(source_dir) == os.path.abspath(dest_dir):
        raise ValueError("Destination directory must be different from source.")
    if not os.path.isdir(source_dir):
        return False
    if os.path.exists(dest_dir):
        marker = os.path.join(dest_dir, MARKER_FILENAME)
        if not os.path.isfile(marker):
            raise RuntimeError(
                f"Refusing to overwrite {dest_dir} because {MARKER_FILENAME} is missing."
            )
        shutil.rmtree(dest_dir)
    shutil.copytree(source_dir, dest_dir)
    with open(os.path.join(dest_dir, MARKER_FILENAME), "w", encoding="utf-8") as handle:
        handle.write("generated\n")
    return True


def main():
    parser = argparse.ArgumentParser(
        description="Generate redirect_from entries without modifying source content."
    )
    parser.add_argument(
        "--source",
        default=DEFAULT_SOURCE,
        help="Source collections directory (default: _content).",
    )
    parser.add_argument(
        "--dest",
        default=DEFAULT_DEST,
        help="Destination collections directory (default: _content_redirects).",
    )
    args = parser.parse_args()

    source_dir = resolve_path(args.source)
    dest_dir = resolve_path(args.dest)

    has_source = prepare_destination(source_dir, dest_dir)
    if not has_source:
        rel_source = os.path.relpath(source_dir, ROOT)
        rel_dest = os.path.relpath(dest_dir, ROOT)
        created = ensure_empty_dest(dest_dir)
        if created:
            print(f"redirect: {rel_source} missing; created empty {rel_dest}")
        return 0

    total = 0
    # Use timezone-aware UTC datetime (compatible with older Python).
    try:
        utc = datetime.UTC
    except AttributeError:
        utc = datetime.timezone.utc
    today = datetime.datetime.now(utc).date()
    for label, path in collection_paths(dest_dir).items():
        if not os.path.isdir(path):
            continue
        total += process_collection(label, path, today)

    rel_dest = os.path.relpath(dest_dir, ROOT)
    if total == 0:
        print(f"redirect: no changes in {rel_dest}")
    else:
        print(f"redirect: updated {total} file(s) in {rel_dest}")


if __name__ == "__main__":
    sys.exit(main())
