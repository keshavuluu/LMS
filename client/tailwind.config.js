/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        default: "#1A1A1A", // You can change this hex code to your preferred color
      },
      fontSize:{
        'course-details-heading-small':['26px','36px'],
        'course-details-heading-large':['36px','44px'],
        'home-heading-small':['28px','34px'],
        'home-heading-large':['34px','40px'],
        'default':['15px','21px']
      },
      gridTemplateColumns:{
        'auto' : 
        'repeat(auto-fill, minmax(250px, 1fr))',
      },
      spacing:{
        'section-height' :'500px',
      },
      maxWidth:{
        'course-card':'424px'
      },
      boxShadow:{
        'custom-card':'0px 4px 15px 2px rgba(0,0,0,0.1)'
      }
    },
  },
  plugins: [],
};
