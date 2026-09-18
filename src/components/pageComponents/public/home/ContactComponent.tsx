"use client";

import React, { useState } from "react";
import {
    Box,
    Typography,
    TextField,
    Card,
    CardContent,
    Divider,
    Stack,
    useTheme,
    useMediaQuery
} from "@mui/material";
import {
    LocationOn,
    Email,
    Phone,
    AccessTime,
    Send
} from "@mui/icons-material";
import 'react-toastify/dist/ReactToastify.css';
import SubmitButton from "@/components/shared/reusable-component/SubmitButton";
import { theStar } from "@/lib/requiredJSX";
import CancelButton from "@/components/shared/reusable-component/CancelButton";

const ContactComponent = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [isSubmitting, ] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // const handleSubmit = async (e: React.FormEvent) => {
    //     e.preventDefault();
    //     setIsSubmitting(true);

    //     try {
    //         const response = await fetch(`localhost:5000/api/v1/inquery/upload-message`, {
    //             method: "POST",
    //             headers: { "Content-Type": "application/json" },
    //             body: JSON.stringify(formData),
    //         });

    //         if (response.ok) {
    //             toast.success('Your message has been submitted successfully!');
    //             setFormData({ name: '', email: '', message: '' });
    //         } else {
    //             throw new Error('Submission failed');
    //         }
    //     } catch (error) {
    //         toast.error('Failed to submit your inquiry. Please try again.');
    //         console.error(error);
    //     } finally {
    //         setIsSubmitting(false);
    //     }
    // };

    // Mock data - replace with your actual data
    
    
    const contactInfo = {
        title: "Contact Our School",
        description: "We're here to help with any questions about admissions, programs, or school activities.",
        address: "123 Education Lane, Learning City, 12345",
        phones: ["+8801761043883", "+8801761043884"],
        email: "info@schoolmanagement.edu",
        businessHours: "Monday - Friday: 8:00 AM - 4:00 PM\nSaturday: 9:00 AM - 1:00 PM"
    };

    const location = {
        lat: 24.8211,
        lng: 89.3628,
    };

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            alignItems: 'center' // This centers children horizontally
        }}>
            {/* Main Content Container - Centered with maxWidth */}
            <Box sx={{
                maxWidth: 1400,
                width: '100%',
                px: isMobile ? 2 : 4,
                display: 'flex',
                flexDirection: 'column',
                
            }}>
                <Typography variant="h3" component="h1" sx={{
                    textAlign: 'center',
                    color: '#035140',
                    fontWeight: 'bold',
                    mt: 4,
                    width: '100%' // Ensures full width for proper centering
                }}>
                    Contact Us
                </Typography>
                 <div className="ml-0 xl:ml-[52px] mb-2">
                    <CancelButton onClick={() => window.history.back()}>Back</CancelButton>
                 </div>
               
                <Box sx={{
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    gap: 4,
                    width: '100%',
                    justifyContent: 'center' // Centers the two columns
                }}>
                    {/* Contact Form */}

                    <Box sx={{
                        width: isMobile ? '100%' : '50%',
                        maxWidth: isMobile ? '100%' : 600 // Limits maximum width
                    }}>

                        <Card sx={{
                            borderRadius: 2,
                            boxShadow: 3,
                            height: '100%'
                        }}>
                            <CardContent sx={{ p: 4 }}>
                                <Typography variant="h5" component="h2" sx={{
                                    mb: 3,
                                    color: '#035140',
                                    fontWeight: 'medium'
                                }}>
                                    Send Us a Message
                                </Typography>

                                <Box component="form" sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 3
                                }}>
                                    <TextField
                                        fullWidth
                                        label={
                                            <>
                                                Your Name
                                                {theStar}
                                            </>
                                        }
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        variant="outlined"
                                    />

                                    <TextField
                                        fullWidth
                                        label={
                                            <>
                                                Email Email
                                                {theStar}
                                            </>
                                        }
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        variant="outlined"
                                    />

                                    <TextField
                                        fullWidth
                                        label={
                                            <>
                                                Your Message
                                                {theStar}
                                            </>
                                        }
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        multiline
                                        rows={10}
                                        variant="outlined"
                                    />

                                    <Box sx={{
                                        display: 'flex',
                                        justifyContent: 'flex-end'
                                    }}>
                                        <SubmitButton sx={{
                                            textTransform: 'none',
                                            py: 1.5,
                                            px: 4,
                                            fontWeight: 'bold',
                                            width: isMobile ? '100%' : 'auto'
                                        }}>{isSubmitting ? 'Sending...' : 'Send Message'} <Send /></SubmitButton>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Box>

                    {/* Contact Information */}
                    <Box sx={{
                        width: isMobile ? '100%' : '50%',
                        maxWidth: isMobile ? '100%' : 600 // Limits maximum width
                    }}>
                        <Card sx={{
                            borderRadius: 2,
                            boxShadow: 3,
                            height: '100%'
                        }}>
                            <CardContent sx={{ p: 4 }}>
                                <Typography variant="h5" component="h2" sx={{
                                    mb: 3,
                                    color: '#035140',
                                    fontWeight: 'medium'
                                }}>
                                    Contact Information
                                </Typography>

                                <Typography variant="h6" sx={{
                                    mb: 2,
                                    color: 'text.secondary',
                                    fontWeight: 'medium'
                                }}>
                                    {contactInfo.title}
                                </Typography>

                                <Typography variant="body1" sx={{ mb: 3 }}>
                                    {contactInfo.description}
                                </Typography>

                                <Divider sx={{ my: 3 }} />

                                <Stack spacing={3}>
                                    {/* Address */}
                                    <Box>
                                        <Typography variant="subtitle1" sx={{
                                            mb: 1,
                                            fontWeight: 'bold',
                                            display: 'flex',
                                            alignItems: 'center'
                                        }}>
                                            <LocationOn color="primary" sx={{ mr: 1 }} />
                                            Address
                                        </Typography>
                                        <Typography variant="body1">
                                            {contactInfo.address}
                                        </Typography>
                                    </Box>

                                    {/* Phone Numbers */}
                                    <Box>
                                        <Typography variant="subtitle1" sx={{
                                            mb: 1,
                                            fontWeight: 'bold',
                                            display: 'flex',
                                            alignItems: 'center'
                                        }}>
                                            <Phone color="primary" sx={{ mr: 1 }} />
                                            Phone Numbers
                                        </Typography>
                                        <Box sx={{
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            gap: 2
                                        }}>
                                            {contactInfo.phones.map((phone, index) => (
                                                <Typography
                                                    key={index}
                                                    component="a"
                                                    href={`tel:${phone}`}
                                                    sx={{
                                                        textDecoration: 'none',
                                                        color: '#035140',
                                                        '&:hover': {
                                                            textDecoration: 'underline'
                                                        }
                                                    }}
                                                >
                                                    {phone}
                                                </Typography>
                                            ))}
                                        </Box>
                                    </Box>

                                    {/* Email */}
                                    <Box>
                                        <Typography variant="subtitle1" sx={{
                                            mb: 1,
                                            fontWeight: 'bold',
                                            display: 'flex',
                                            alignItems: 'center'
                                        }}>
                                            <Email color="primary" sx={{ mr: 1 }} />
                                            Email
                                        </Typography>
                                        <Typography
                                            component="a"
                                            href={`mailto:${contactInfo.email}`}
                                            sx={{
                                                textDecoration: 'none',
                                                color: '#035140',
                                                '&:hover': {
                                                    textDecoration: 'underline'
                                                }
                                            }}
                                        >
                                            {contactInfo.email}
                                        </Typography>
                                    </Box>

                                    {/* Business Hours */}
                                    <Box>
                                        <Typography variant="subtitle1" sx={{
                                            mb: 1,
                                            fontWeight: 'bold',
                                            display: 'flex',
                                            alignItems: 'center'
                                        }}>
                                            <AccessTime color="primary" sx={{ mr: 1 }} />
                                            Official Hours to Contact
                                        </Typography>
                                        <Typography variant="body1" whiteSpace="pre-line">
                                            {contactInfo.businessHours}
                                        </Typography>
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Box>
                </Box>
            </Box>

            {/* Map */}
            <Card sx={{ width: '100%', mt: 6 }}>
                <Box sx={{
                    height: { xs: 400, sm: 500 },
                    width: '100%'
                }}>
                    <iframe
                        title="School Location"
                        src={`https://www.google.com/maps?q=${location.lat},${location.lng}&hl=es;z=17&output=embed`}
                        width="100%"
                        height="100%"
                        style={{ border: 'none' }}
                        loading="lazy"
                    />
                </Box>
            </Card>
        </Box>
    );
};

export default ContactComponent;