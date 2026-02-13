#!/usr/bin/env python3
"""
Command Line Interface for Financial Document Agent
"""

import argparse
import sys
from pathlib import Path
from tabulate import tabulate
from financial_agent import FinancialDocumentAgent

from utils import format_currency, generate_summary_report
from config import settings


def process_single(args):
    agent = FinancialDocumentAgent()

    print(f"📄 Processing: {args.image}")

    image_path = Path(args.image)
    if not image_path.exists():
        print("❌ Image file not found")
        return

    result = agent.process_image(image_path)

    if not result or result.get("status") != "success":
        print("❌ Processing failed")
        if result and result.get("error"):
            print("Reason:", result["error"])
        return

    data = result["data"]
    doc_type = data.get("document_type", "unknown")

    print(f"\n{'=' * 60}")
    print(f"Document Type: {doc_type.upper()}")
    print(f"Confidence   : {result.get('confidence_score', 0):.1f}%")
    print(f"{'=' * 60}\n")

    if doc_type == "upi_screenshot":
        table_data = [
            ["Amount", format_currency(data.get("amount"))],
            ["UTR Number", data.get("utr_number", "N/A")],
            ["From", data.get("sender_name", "N/A")],
            ["App", data.get("payment_app", "N/A")],
            ["Date", data.get("date", "N/A")],
        ]
        print(tabulate(table_data, headers=["Field", "Value"], tablefmt="grid"))

    elif doc_type == "invoice":
        table_data = [
            ["Vendor", data.get("vendor_name", "N/A")],
            ["Amount", format_currency(data.get("amount"))],
            ["GSTIN", data.get("gstin", "N/A")],
            ["Date", data.get("date", "N/A")],
        ]
        print(tabulate(table_data, headers=["Field", "Value"], tablefmt="grid"))

        if data.get("items"):
            print("\n📦 Items:")
            for idx, item in enumerate(data["items"], 1):
                print(f"  {idx}. {item}")

    print("\n💾 JSON output saved automatically to `outputs/` directory\n")


def process_batch(args):
    agent = FinancialDocumentAgent()

    # Collect images
    if args.directory:
        image_dir = Path(args.directory)
        if not image_dir.is_dir():
            print(f"❌ {args.directory} is not a valid directory")
            sys.exit(1)

        images = []
        for ext in settings.SUPPORTED_FORMATS:
            images.extend(image_dir.glob(f"*.{ext}"))
    else:
        images = [Path(p) for p in args.images]

    if not images:
        print("❌ No images found to process")
        return

    print(f"📂 Processing {len(images)} images...\n")

    results = agent.batch_process(images)

    print("\n" + generate_summary_report(results))
    print("\n💾 Individual JSON files saved to `outputs/`")
    print("💾 Batch summary saved to `logs/`\n")


def main():
    parser = argparse.ArgumentParser(
        description="Financial Document AI Agent – Extract structured data from receipts & UPI screenshots"
    )

    subparsers = parser.add_subparsers(dest="command")

    # Single image
    single_parser = subparsers.add_parser("process", help="Process a single image")
    single_parser.add_argument("image", help="Path to image file")

    # Batch
    batch_parser = subparsers.add_parser("batch", help="Process multiple images")
    batch_group = batch_parser.add_mutually_exclusive_group(required=True)
    batch_group.add_argument("--directory", "-d", help="Directory containing images")
    batch_group.add_argument("--images", "-i", nargs="+", help="List of image paths")

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        sys.exit(1)

    if args.command == "process":
        process_single(args)
    elif args.command == "batch":
        process_batch(args)


if __name__ == "__main__":
    main()
