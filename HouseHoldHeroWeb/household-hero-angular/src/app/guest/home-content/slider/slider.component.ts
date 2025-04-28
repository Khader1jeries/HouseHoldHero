import { Component } from '@angular/core';

@Component({
  selector: 'app-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.css'],
})
export class SliderComponent {
  paragraphs = [
    {
      title: '🏡 About Us',
      content: [
        'In today’s fast-paced world, managing household tasks and responsibilities can quickly become overwhelming and chaotic. Many families face challenges in keeping track of daily chores, planning activities, and ensuring seamless collaboration among all members of the household.',
        'At HouseHoldHero , we’ve created an innovative solution to address these challenges.',
        'Our household management system provides an efficient, interactive, and user-friendly platform for organizing tasks and responsibilities within the home. Unlike other systems, we focus on making the process enjoyable and motivating for everyone involved.\n',
        'Designed for two main user types – the Admin User and Family Members – our system ensures that every household member can participate effectively in creating a harmonious and well-organized home environment.',
      ],
    },
    {
      title: '🛠️ Features',
      content: [
        '🧹 Task Management',
        'Easily create and assign household tasks to each family member. Stay organized and never forget a chore again!',

        '🏆 Point System & Gamification',
        'Earn points for completing tasks. Compete with family members in a fun and healthy way!',

        '👑 Periodic Winner Announcement',
        'The system automatically declares a family winner based on points — monthly, bi-annually, or yearly — as set by the admin.',

        '📅 Smart Scheduling',
        'Set deadlines, priorities, and reminders to keep everyone on track.',

        '📊 Performance Overview',
        'Admins can view reports and track each family member’s participation and progress.',

        '🔒 Secure & Private',
        'All data is encrypted and visible only to your household members.',
      ],
    },
    {
      title: '🎯 Our Goals',
      content: [
        'Encourage Family Collaboration',
        'Promote teamwork by helping family members work together to manage household responsibilities.',

        'Make Household Tasks Enjoyable',
        'Turn everyday chores into a fun experience using a built-in gamification system that motivates everyone to participate.',

        'Increase Personal Responsibility',
        'Empower each family member to take ownership of their tasks through points and feedback.',

        'Provide Structure and Organization',
        'Offer a clear and simple way to track tasks, deadlines, and performance — all in one place.',

        'Celebrate Effort and Consistency',
        'Recognize consistent participation by announcing periodic winners and building a sense of accomplishment.',

        'Simplify Home Management',
        'Replace physical notes, group chats, and confusion with a single digital platform designed for modern families.',
      ],
    },
  ];

  currentIndex: number = 0;

  nextParagraph() {
    this.currentIndex = (this.currentIndex + 1) % this.paragraphs.length;
  }

  prevParagraph() {
    this.currentIndex =
      (this.currentIndex - 1 + this.paragraphs.length) % this.paragraphs.length;
  }
}
