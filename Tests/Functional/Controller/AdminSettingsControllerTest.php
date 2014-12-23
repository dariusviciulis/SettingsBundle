<?php

/*
 * This file is part of the ONGR package.
 *
 * (c) NFQ Technologies UAB <info@nfq.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace ONGR\AdminBundle\Tests\Functional\Controller;

use ONGR\AdminBundle\Tests\Functional\CookieTestHelper;
use ONGR\AdminBundle\Tests\Functional\PrepareAdminData;
use ONGR\ElasticsearchBundle\Test\ElasticsearchTestCase;
use Symfony\Bundle\FrameworkBundle\Client;

/**
 * Tests for SettingsController.
 */
class AdminSettingsControllerTest extends ElasticsearchTestCase
{
    /**
     * @var PrepareAdminData Elastic helper and index.
     */
    private $elastic;

    /**
     * @var Client.
     */
    private $client;

    /**
     * {@inheritdoc}
     */
    protected function setUp()
    {
        parent::setUp();
        $this->client = self::createClient();
        $this->elastic = new PrepareAdminData();
    }

    /**
     * Test settings page ability to set values to cookie.
     */
    public function testSettingsAction()
    {
        $this->elastic->createIndexSetting();
        $this->elastic->insertSettingData();

        $this->client = self::createClient();
        $this->client->restart();

        // Set authentication cookie.
        CookieTestHelper::setAuthenticationCookie($this->client);

        // Visit settings page.
        $crawler = $this->client->request('GET', '/admin/settings');

        // Assert categories are rendered.
        /** @var array $categories */
        $categories = $this->client->getContainer()->getParameter('ongr_admin.settings.categories');
        $content = $this->client->getResponse()->getContent();

        // Print $content.
        foreach ($categories as $category) {
            $this->assertContains($category['name'], $content);
        }

        // Submit settings form.
        $buttonNode = $crawler->selectButton('settings_submit');
        $form = $buttonNode->form();

        /** @noinspection PhpUndefinedMethodInspection */
        $form['settings[foo_setting_1]']->tick();
        /** @noinspection PhpUndefinedMethodInspection */
        $form['settings[foo_setting_2]']->untick();
        /** @noinspection PhpUndefinedMethodInspection */
        $form['settings[foo_setting_3]']->tick();
        /** @noinspection PhpUndefinedMethodInspection */
        $form['settings[ongr_admin_profile_Acme2]']->tick();
        /** @noinspection PhpUndefinedMethodInspection */
        $form['settings[ongr_admin_profile_Acme1]']->untick();

        $this->client->submit($form);

        // Assert successful redirect.
        $this->assertStringEndsWith(
            '/settings',
            $this->client->getResponse()->headers->get('location'),
            'response must be a correct redirect'
        );

        // Assert cookie values updated.
        $cookieValue = $this->client
            ->getCookieJar()
            ->get($this->client->getContainer()->getParameter('ongr_admin.settings.settings_cookie.name'))
            ->getValue();

        $expectedValue = [
            'foo_setting_1' => true,
            'foo_setting_2' => false,
            'foo_setting_3' => true,
            'ongr_admin_profile_Acme2' => true,
            'ongr_admin_profile_Acme1' => false,
        ];
        $this->assertJsonStringEqualsJsonString(json_encode($expectedValue), $cookieValue);

        // Try to change value through change setting action.
        $this->client->request('get', '/admin/setting/change/' . base64_encode('foo_setting_1'));

        // Assert cookie values updated.
        $cookieValue = $this->client
            ->getCookieJar()
            ->get($this->client->getContainer()->getParameter('ongr_admin.settings.settings_cookie.name'))
            ->getValue();
        $expectedValue['foo_setting_1'] = true;
        $this->assertJsonStringEqualsJsonString(json_encode($expectedValue), $cookieValue);

        $this->elastic->cleanUp();
        $this->client->restart();
    }

    /**
     * Data provider for testActionsWhenNotLoggedIn.
     *
     * @return array
     */
    public function getTestActionsWhenNotLoggedInData()
    {
        return [
            ['/admin/settings', 302],
            ['/admin/setting/change/new', 403],
        ];
    }

    /**
     * Settings pages should not be allowed to access non-authorized users.
     *
     * @param string $url
     * @param int    $status
     *
     * @dataProvider getTestActionsWhenNotLoggedInData
     */
    public function testActionsWhenNotLoggedIn($url, $status = 200)
    {
        // Visit settings page.
        $this->client->request('GET', $url);

        // Assert access is redirected.
        $this->assertSame($status, $this->client->getResponse()->getStatusCode());
    }
}