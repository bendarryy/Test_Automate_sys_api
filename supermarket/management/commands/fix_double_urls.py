from django.core.management.base import BaseCommand
from django.db import transaction
from urllib.parse import unquote
from supermarket.models import Product


class Command(BaseCommand):
    help = 'Fix double URLs in Product image field by extracting the second URL'

    def add_arguments(self, parser):
        parser.add_argument(
            '--preview',
            action='store_true',
            help='Preview products with double URLs without fixing them',
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help='Skip confirmation prompt',
        )

    def handle(self, *args, **options):
        if options['preview']:
            self.preview_double_urls()
        else:
            self.fix_double_urls(options['force'])

    def fix_double_urls(self, force=False):
        """
        Fix double URLs in Product image field by extracting the second URL.
        """
        self.stdout.write("Starting to fix double URLs in Product image field...")
        
        # Get all products with image field
        products = Product.objects.filter(image__isnull=False).exclude(image='')
        
        fixed_count = 0
        total_count = products.count()
        
        self.stdout.write(f"Found {total_count} products with images to check...")
        
        if not force:
            response = input("This will modify the database. Are you sure? (y/N): ")
            if response.lower() not in ['y', 'yes']:
                self.stdout.write("Operation cancelled.")
                return
        
        with transaction.atomic():
            for product in products:
                current_image = str(product.image)
                
                # Check if it's a double URL pattern
                # Pattern: @https://res.cloudinary.com/.../media/https://...
                if current_image.startswith('@https://') and '/media/https://' in current_image:
                    try:
                        # Extract the second URL (after /media/)
                        second_url_start = current_image.find('/media/https://')
                        if second_url_start != -1:
                            # Get the URL starting from https://
                            second_url = current_image[second_url_start + 7:]  # +7 to skip '/media/'
                            
                            # URL decode the second URL
                            decoded_url = unquote(second_url)
                            
                            self.stdout.write(f"Product ID {product.id} - {product.name}")
                            self.stdout.write(f"  Before: {current_image}")
                            self.stdout.write(f"  After:  {decoded_url}")
                            self.stdout.write("-" * 80)
                            
                            # Update the product with the fixed URL
                            product.image = decoded_url
                            product.save(update_fields=['image'])
                            
                            fixed_count += 1
                            
                    except Exception as e:
                        self.stdout.write(
                            self.style.ERROR(f"Error processing product {product.id}: {e}")
                        )
                        continue
        
        self.stdout.write(f"\nFix completed!")
        self.stdout.write(f"Total products checked: {total_count}")
        self.stdout.write(f"Products fixed: {fixed_count}")
        self.stdout.write(f"Products unchanged: {total_count - fixed_count}")

    def preview_double_urls(self):
        """
        Preview products with double URLs without fixing them.
        """
        self.stdout.write("Previewing products with double URLs...")
        
        products = Product.objects.filter(image__isnull=False).exclude(image='')
        
        double_url_count = 0
        
        for product in products:
            current_image = str(product.image)
            
            if current_image.startswith('@https://') and '/media/https://' in current_image:
                double_url_count += 1
                self.stdout.write(f"Product ID {product.id} - {product.name}")
                self.stdout.write(f"  Double URL: {current_image}")
                self.stdout.write("-" * 80)
        
        self.stdout.write(f"Found {double_url_count} products with double URLs") 