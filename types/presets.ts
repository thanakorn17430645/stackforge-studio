import type { PresetTemplate } from './template'

export const PRESET_TEMPLATES: PresetTemplate[] = [
  {
    id: 'ecommerce-pro',
    name: 'E-Commerce Core',
    description: 'Modern Online Store with Product Catalog, Order Processing, and Customer Management.',
    badge: 'Popular',
    icon: 'ShoppingCart',
    config: {
      projectName: 'ECommerceStore',
      description: 'Full-stack E-Commerce scaffold with Product, Category, and Order management.',
      backend: 'dotnet',
      frontend: 'vue',
      database: 'postgres',
      dockerMode: 'dev',
      auth: true,
      apiDocs: 'swagger',
      mockDataCount: 10,
      entities: [
        {
          id: 'category',
          name: 'Category',
          label: 'หมวดหมู่สินค้า (Categories)',
          fields: [
            { id: 'c1', name: 'name', type: 'string', required: true, label: 'Category Name' },
            { id: 'c2', name: 'slug', type: 'string', required: true, isUnique: true, label: 'URL Slug' },
            { id: 'c3', name: 'description', type: 'text', required: false, label: 'Description' }
          ]
        },
        {
          id: 'product',
          name: 'Product',
          label: 'สินค้า (Products)',
          fields: [
            { id: 'p1', name: 'title', type: 'string', required: true, label: 'Product Title' },
            { id: 'p2', name: 'sku', type: 'string', required: true, isUnique: true, label: 'SKU Code' },
            { id: 'p3', name: 'price', type: 'decimal', required: true, label: 'Price (THB)' },
            { id: 'p4', name: 'stock', type: 'int', required: true, defaultValue: '0', label: 'In Stock' },
            { id: 'p5', name: 'isAvailable', type: 'boolean', required: true, defaultValue: 'true', label: 'Active' },
            { id: 'p6', name: 'description', type: 'text', required: false, label: 'Description' }
          ]
        },
        {
          id: 'customer',
          name: 'Customer',
          label: 'ข้อมูลลูกค้า (Customers)',
          fields: [
            { id: 'cu1', name: 'fullName', type: 'string', required: true, label: 'Full Name' },
            { id: 'cu2', name: 'email', type: 'string', required: true, isUnique: true, label: 'Email' },
            { id: 'cu3', name: 'phoneNumber', type: 'string', required: false, label: 'Phone' },
            { id: 'cu4', name: 'address', type: 'text', required: false, label: 'Shipping Address' }
          ]
        },
        {
          id: 'order',
          name: 'Order',
          label: 'คำสั่งซื้อ (Orders)',
          fields: [
            { id: 'o1', name: 'orderNumber', type: 'string', required: true, isUnique: true, label: 'Order #' },
            { id: 'o2', name: 'totalAmount', type: 'decimal', required: true, label: 'Total Amount' },
            { id: 'o3', name: 'status', type: 'string', required: true, defaultValue: "'Pending'", label: 'Status' },
            { id: 'o4', name: 'orderDate', type: 'datetime', required: true, label: 'Order Date' }
          ]
        }
      ]
    }
  },
  {
    id: 'saas-crm-suite',
    name: 'SaaS CRM & Leads',
    description: 'Enterprise Sales Pipeline, Customer Leads, Deals, and Task Manager with JWT Auth.',
    badge: 'Enterprise',
    icon: 'Briefcase',
    config: {
      projectName: 'CRMPlatform',
      description: 'Enterprise CRM scaffold with Lead tracking, Deal stages, and Activities.',
      backend: 'dotnet',
      frontend: 'vue',
      database: 'postgres',
      dockerMode: 'dev',
      auth: true,
      apiDocs: 'swagger',
      mockDataCount: 8,
      entities: [
        {
          id: 'lead',
          name: 'Lead',
          label: 'ผู้มีแนวโน้ม (Leads)',
          fields: [
            { id: 'l1', name: 'name', type: 'string', required: true, label: 'Contact Name' },
            { id: 'l2', name: 'company', type: 'string', required: false, label: 'Company' },
            { id: 'l3', name: 'email', type: 'string', required: true, label: 'Email' },
            { id: 'l4', name: 'phone', type: 'string', required: false, label: 'Phone' },
            { id: 'l5', name: 'status', type: 'string', required: true, defaultValue: "'New'", label: 'Stage' }
          ]
        },
        {
          id: 'deal',
          name: 'Deal',
          label: 'โอกาสการขาย (Deals)',
          fields: [
            { id: 'd1', name: 'title', type: 'string', required: true, label: 'Deal Title' },
            { id: 'd2', name: 'value', type: 'decimal', required: true, label: 'Estimated Value' },
            { id: 'd3', name: 'probability', type: 'int', required: true, defaultValue: '50', label: 'Probability %' },
            { id: 'd4', name: 'closeDate', type: 'datetime', required: true, label: 'Expected Close' },
            { id: 'd5', name: 'stage', type: 'string', required: true, defaultValue: "'Proposal'", label: 'Deal Stage' }
          ]
        },
        {
          id: 'activity',
          name: 'Activity',
          label: 'บันทึกกิจกรรม (Activities)',
          fields: [
            { id: 'a1', name: 'type', type: 'string', required: true, defaultValue: "'Call'", label: 'Activity Type' },
            { id: 'a2', name: 'notes', type: 'text', required: true, label: 'Meeting / Call Notes' },
            { id: 'a3', name: 'scheduledAt', type: 'datetime', required: true, label: 'Scheduled Time' },
            { id: 'a4', name: 'isDone', type: 'boolean', required: true, defaultValue: 'false', label: 'Completed' }
          ]
        }
      ]
    }
  },
  {
    id: 'clinic-care',
    name: 'Pet / Medical Clinic',
    description: 'Appointment Scheduling, Patient/Pet Records, Doctor Profiles & Prescriptions.',
    badge: 'Healthcare',
    icon: 'HeartPulse',
    config: {
      projectName: 'ClinicCareApp',
      description: 'Clinic management with Patients, Appointments, and Medical Records.',
      backend: 'dotnet',
      frontend: 'vue',
      database: 'postgres',
      dockerMode: 'dev',
      auth: true,
      apiDocs: 'swagger',
      mockDataCount: 8,
      entities: [
        {
          id: 'patient',
          name: 'Patient',
          label: 'ข้อมูลผู้ป่วย/สัตว์เลี้ยง (Patients)',
          fields: [
            { id: 'pt1', name: 'name', type: 'string', required: true, label: 'Name' },
            { id: 'pt2', name: 'species', type: 'string', required: false, defaultValue: "'Canine'", label: 'Species/Type' },
            { id: 'pt3', name: 'age', type: 'int', required: true, defaultValue: '2', label: 'Age (Years)' },
            { id: 'pt4', name: 'ownerName', type: 'string', required: true, label: 'Owner Name' },
            { id: 'pt5', name: 'ownerPhone', type: 'string', required: true, label: 'Owner Phone' }
          ]
        },
        {
          id: 'appointment',
          name: 'Appointment',
          label: 'การนัดหมาย (Appointments)',
          fields: [
            { id: 'ap1', name: 'reason', type: 'string', required: true, label: 'Reason for Visit' },
            { id: 'ap2', name: 'appointmentDate', type: 'datetime', required: true, label: 'Appointment Date' },
            { id: 'ap3', name: 'doctor', type: 'string', required: true, label: 'Attending Doctor' },
            { id: 'ap4', name: 'status', type: 'string', required: true, defaultValue: "'Scheduled'", label: 'Status' }
          ]
        },
        {
          id: 'medical_record',
          name: 'MedicalRecord',
          label: 'ประวัติการรักษา (Medical Records)',
          fields: [
            { id: 'mr1', name: 'diagnosis', type: 'string', required: true, label: 'Diagnosis' },
            { id: 'mr2', name: 'treatment', type: 'text', required: true, label: 'Treatment Given' },
            { id: 'mr3', name: 'cost', type: 'decimal', required: true, label: 'Treatment Fee' },
            { id: 'mr4', name: 'recordDate', type: 'datetime', required: true, label: 'Record Date' }
          ]
        }
      ]
    }
  },
  {
    id: 'blog-cms',
    name: 'Modern Blog & CMS',
    description: 'Content Management Platform with Articles, Media, Categories, and Reader Comments.',
    badge: 'Content',
    icon: 'FileText',
    config: {
      projectName: 'ModernBlogCMS',
      description: 'CMS and Content publishing platform with full moderation.',
      backend: 'nestjs',
      frontend: 'react',
      database: 'mysql',
      dockerMode: 'dev',
      auth: true,
      apiDocs: 'swagger',
      mockDataCount: 6,
      entities: [
        {
          id: 'post',
          name: 'Post',
          label: 'บทความ (Posts)',
          fields: [
            { id: 'b1', name: 'title', type: 'string', required: true, label: 'Post Title' },
            { id: 'b2', name: 'slug', type: 'string', required: true, isUnique: true, label: 'URL Slug' },
            { id: 'b3', name: 'content', type: 'text', required: true, label: 'Content Markdown' },
            { id: 'b4', name: 'isPublished', type: 'boolean', required: true, defaultValue: 'true', label: 'Published' },
            { id: 'b5', name: 'views', type: 'int', required: true, defaultValue: '0', label: 'View Count' }
          ]
        },
        {
          id: 'comment',
          name: 'Comment',
          label: 'ความคิดเห็น (Comments)',
          fields: [
            { id: 'cm1', name: 'authorName', type: 'string', required: true, label: 'Author Name' },
            { id: 'cm2', name: 'email', type: 'string', required: true, label: 'Author Email' },
            { id: 'cm3', name: 'body', type: 'text', required: true, label: 'Comment Body' },
            { id: 'cm4', name: 'isApproved', type: 'boolean', required: true, defaultValue: 'true', label: 'Approved' }
          ]
        }
      ]
    }
  }
]
