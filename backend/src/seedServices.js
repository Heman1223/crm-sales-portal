const mongoose = require('mongoose');
const Service = require('./models/Service');
require('dotenv').config();

const services = [
    // IT Services
    {
        name: 'Website Development',
        description: 'Custom website development with modern technologies',
        category: 'IT Services',
        basePrice: 25000,
        commissionRate: 15
    },
    {
        name: 'Mobile App Development',
        description: 'Native and cross-platform mobile application development',
        category: 'IT Services',
        basePrice: 50000,
        commissionRate: 18
    },
    {
        name: 'E-commerce Platform',
        description: 'Complete e-commerce solution with payment integration',
        category: 'IT Services',
        basePrice: 75000,
        commissionRate: 20
    },
    {
        name: 'Software Maintenance',
        description: 'Ongoing software support and maintenance services',
        category: 'IT Services',
        basePrice: 15000,
        commissionRate: 12
    },

    // Digital Marketing
    {
        name: 'SEO Optimization',
        description: 'Search engine optimization for better online visibility',
        category: 'Digital Marketing',
        basePrice: 20000,
        commissionRate: 15
    },
    {
        name: 'Social Media Marketing',
        description: 'Comprehensive social media marketing campaigns',
        category: 'Digital Marketing',
        basePrice: 18000,
        commissionRate: 14
    },
    {
        name: 'Google Ads Management',
        description: 'Professional Google Ads campaign management',
        category: 'Digital Marketing',
        basePrice: 22000,
        commissionRate: 16
    },
    {
        name: 'Content Marketing',
        description: 'Strategic content creation and marketing services',
        category: 'Digital Marketing',
        basePrice: 16000,
        commissionRate: 13
    },

    // Design Services
    {
        name: 'Logo Design',
        description: 'Professional logo design and branding',
        category: 'Design Services',
        basePrice: 8000,
        commissionRate: 12
    },
    {
        name: 'UI/UX Design',
        description: 'User interface and experience design for applications',
        category: 'Design Services',
        basePrice: 30000,
        commissionRate: 17
    },
    {
        name: 'Graphic Design',
        description: 'Complete graphic design solutions for marketing materials',
        category: 'Design Services',
        basePrice: 12000,
        commissionRate: 13
    },
    {
        name: 'Brand Identity Package',
        description: 'Complete brand identity design including logo, colors, and guidelines',
        category: 'Design Services',
        basePrice: 35000,
        commissionRate: 18
    },

    // Business Automation
    {
        name: 'CRM Implementation',
        description: 'Customer relationship management system setup and customization',
        category: 'Business Automation',
        basePrice: 40000,
        commissionRate: 19
    },
    {
        name: 'Inventory Management System',
        description: 'Automated inventory tracking and management solution',
        category: 'Business Automation',
        basePrice: 35000,
        commissionRate: 17
    },
    {
        name: 'Accounting Software Setup',
        description: 'Professional accounting software implementation and training',
        category: 'Business Automation',
        basePrice: 25000,
        commissionRate: 15
    },
    {
        name: 'Workflow Automation',
        description: 'Custom workflow automation to streamline business processes',
        category: 'Business Automation',
        basePrice: 45000,
        commissionRate: 20
    },

    // Consulting Services
    {
        name: 'Digital Transformation Consulting',
        description: 'Strategic consulting for digital business transformation',
        category: 'Consulting Services',
        basePrice: 60000,
        commissionRate: 22
    },
    {
        name: 'IT Strategy Planning',
        description: 'Comprehensive IT strategy and roadmap development',
        category: 'Consulting Services',
        basePrice: 50000,
        commissionRate: 20
    },
    {
        name: 'Business Process Analysis',
        description: 'Detailed analysis and optimization of business processes',
        category: 'Consulting Services',
        basePrice: 40000,
        commissionRate: 18
    },
    {
        name: 'Technology Audit',
        description: 'Complete technology infrastructure audit and recommendations',
        category: 'Consulting Services',
        basePrice: 35000,
        commissionRate: 17
    }
];

const seedServices = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing services
        await Service.deleteMany({});
        console.log('🗑️ Cleared existing services');

        // Insert new services
        const createdServices = await Service.insertMany(services);
        console.log(`✅ Created ${createdServices.length} services`);

        // Display summary by category
        const categories = [...new Set(services.map(s => s.category))];
        console.log('\n📊 Services by Category:');
        for (const category of categories) {
            const categoryServices = services.filter(s => s.category === category);
            console.log(`  ${category}: ${categoryServices.length} services`);
        }

        console.log('\n🎉 Service seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding services:', error);
        process.exit(1);
    }
};

// Run the seeder
if (require.main === module) {
    seedServices();
}

module.exports = { seedServices, services };